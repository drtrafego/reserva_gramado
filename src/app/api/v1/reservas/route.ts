import { NextRequest } from 'next/server'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { validarApiKey, respostaErro } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { reservas, restauranteConfig } from '@/lib/db/schema'

const criarReservaSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  nomeCliente: z.string().min(1).max(150),
  telefone: z.string().max(20).optional(),
  horarioReservado: z.string().regex(/^\d{2}:\d{2}$/, 'Horário no formato HH:MM'),
  adultos: z.number().int().min(1),
  criancas50pct: z.number().int().min(0).default(0),
  criancasIsento: z.number().int().min(0).default(0),
  valorPorPessoa: z.number().min(0),
  observacoes: z.string().max(500).optional(),
})

function calcularTotal(adultos: number, criancas50: number, valorPorPessoa: number) {
  return adultos * valorPorPessoa + criancas50 * (valorPorPessoa * 0.5)
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

  const { data, nomeCliente, telefone, horarioReservado, adultos, criancas50pct, criancasIsento, valorPorPessoa, observacoes } = parsed.data

  // Verificação atômica de capacidade + inserção em uma única transação
  let novaReserva: typeof reservas.$inferSelect | null = null
  let erroCapacidade: { disponivel: number; solicitado: number } | null = null

  try {
  await db.transaction(async (tx) => {
    // Lock por data+horario: só serializa quem quer o mesmo horário.
    // Pessoas em horários diferentes correm em paralelo sem se bloquear.
    // Timeout de 5s evita que a request fique presa indefinidamente em caso extremo.
    await tx.execute(sql`SET LOCAL lock_timeout = '5s'`)
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`reserva:${data}:${horarioReservado}`}))`)

    const configs = await tx.select().from(restauranteConfig).limit(1)
    const config = configs[0]
    if (!config) throw new Error('CONFIG_NOT_FOUND')

    const [ocupacaoRow] = await tx
      .select({
        ocupado: sql<string>`coalesce(sum(${reservas.adultos} + ${reservas.criancas50pct} + ${reservas.criancasIsento}), 0)`,
      })
      .from(reservas)
      .where(and(eq(reservas.data, data), eq(reservas.status, 'pendente')))

    const ocupado = Number(ocupacaoRow.ocupado)
    const totalNovos = adultos + criancas50pct + criancasIsento
    const disponivel = config.capacidadeEfetiva - ocupado

    if (totalNovos > disponivel) {
      erroCapacidade = { disponivel, solicitado: totalNovos }
      return
    }

    const total = calcularTotal(adultos, criancas50pct, valorPorPessoa)

    const inseridas = await tx
      .insert(reservas)
      .values({
        data,
        nomeCliente,
        telefone: telefone ?? null,
        horarioReservado,
        adultos,
        criancas50pct,
        criancasIsento,
        valorPorPessoa: String(valorPorPessoa),
        valorTotal: String(total),
        canalOrigem: 'whatsapp',
        status: 'pendente',
        observacoes: observacoes ?? null,
      })
      .returning()

    novaReserva = inseridas[0] ?? null
  })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('lock timeout') || msg.includes('canceling statement')) {
      return Response.json(
        { erro: 'Sistema ocupado, tente novamente em instantes', retry: true },
        { status: 503 }
      )
    }
    throw err
  }

  if (erroCapacidade) {
    const { disponivel, solicitado } = erroCapacidade as { disponivel: number; solicitado: number }
    return Response.json(
      { erro: 'Capacidade esgotada para esta data', disponivel, solicitado },
      { status: 409 }
    )
  }

  if (!novaReserva) return respostaErro('Erro ao criar reserva', 500)

  return Response.json({ reserva: novaReserva }, { status: 201 })
}
