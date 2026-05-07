import { NextRequest } from 'next/server'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { validarApiKey, respostaErro } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { reservas, restauranteConfig } from '@/lib/db/schema'

const VALOR_CRIANCA_MEIA = 39.95

const criarReservaSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  nomeCliente: z.string().min(1).max(150),
  telefone: z.string().max(20).optional(),
  horarioReservado: z.string().regex(/^\d{2}:\d{2}$/, 'Horário no formato HH:MM'),
  adultos: z.number().int().min(1),
  criancasMeia: z.number().int().min(0).default(0),
  criancasIsento: z.number().int().min(0).default(0),
  valorPorPessoa: z.number().min(0),
  mesasUnificadas: z.boolean().optional().default(false),
  observacoes: z.string().max(500).optional(),
})

function calcularTotal(adultos: number, criancasMeia: number, valorPorPessoa: number) {
  return adultos * valorPorPessoa + criancasMeia * VALOR_CRIANCA_MEIA
}

export async function GET(req: NextRequest) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { searchParams } = new URL(req.url)
  const telefone = searchParams.get('telefone')
  const data = searchParams.get('data')

  if (!telefone && !data) {
    return respostaErro('Informe "telefone" ou "data" para filtrar', 400)
  }

  const conditions = []
  if (telefone) conditions.push(eq(reservas.telefone, telefone))
  if (data) conditions.push(eq(reservas.data, data))

  const resultado = await db
    .select()
    .from(reservas)
    .where(conditions.length === 1 ? conditions[0] : and(...conditions))
    .orderBy(reservas.data, reservas.horarioReservado)
    .limit(50)

  return Response.json({ reservas: resultado })
}

export async function POST(req: NextRequest) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return respostaErro('Body inválido', 400)
  }

  const parsed = criarReservaSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { erro: 'Dados inválidos', campos: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const {
    data, nomeCliente, telefone, horarioReservado,
    adultos, criancasMeia, criancasIsento, valorPorPessoa, mesasUnificadas, observacoes,
  } = parsed.data

  const totalNovos = adultos + criancasMeia + criancasIsento
  const total = calcularTotal(adultos, criancasMeia, valorPorPessoa)

  const result = await db.execute(sql`
    INSERT INTO reservas (
      data, nome_cliente, telefone, horario_reservado,
      adultos, criancas_50pct, criancas_isento,
      valor_por_pessoa, valor_total,
      canal_origem, status, mesas_unificadas, observacoes
    )
    SELECT
      ${data}, ${nomeCliente}, ${telefone ?? null}, ${horarioReservado},
      ${adultos}, ${criancasMeia}, ${criancasIsento},
      ${String(valorPorPessoa)}, ${String(total)},
      'whatsapp', 'pendente', ${mesasUnificadas ?? false}, ${observacoes ?? null}
    WHERE (
      SELECT COALESCE(SUM(adultos + criancas_50pct + criancas_isento), 0)
      FROM reservas
      WHERE data = ${data} AND status = 'pendente'
    ) + ${totalNovos} <= (
      SELECT capacidade_efetiva FROM restaurante_config LIMIT 1
    )
    RETURNING *
  `)

  const rows = result.rows as Array<Record<string, unknown>>

  if (rows.length === 0) {
    // Verificar quantas vagas restam para dar resposta útil ao bot
    const [config] = await db.select().from(restauranteConfig).limit(1)
    const [{ ocupado }] = await db
      .select({ ocupado: sql<string>`coalesce(sum(adultos + criancas_50pct + criancas_isento), 0)` })
      .from(reservas)
      .where(and(eq(reservas.data, data), eq(reservas.status, 'pendente')))

    const disponivel = config ? config.capacidadeEfetiva - Number(ocupado) : 0
    return Response.json(
      { erro: 'Capacidade esgotada para esta data', disponivel, solicitado: totalNovos },
      { status: 409 }
    )
  }

  // Mapear snake_case do SQL para camelCase do schema
  const row = rows[0]
  const novaReserva = {
    id: row.id,
    data: row.data,
    nomeCliente: row.nome_cliente,
    telefone: row.telefone,
    horarioReservado: row.horario_reservado,
    horarioChegada: row.horario_chegada,
    adultos: row.adultos,
    criancas50pct: row.criancas_50pct,
    criancasIsento: row.criancas_isento,
    pessoasChegada: row.pessoas_chegada,
    valorPorPessoa: row.valor_por_pessoa,
    valorTotal: row.valor_total,
    canalOrigem: row.canal_origem,
    status: row.status,
    observacoes: row.observacoes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  return Response.json({ reserva: novaReserva }, { status: 201 })
}
