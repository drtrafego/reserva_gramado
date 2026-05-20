import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { validarApiKey, respostaErro } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'

const VALOR_CRIANCA_MEIA = 39.95

const atualizarReservaSchema = z.object({
  nomeCliente: z.string().min(1).max(150).optional(),
  telefone: z.string().max(20).optional(),
  horarioReservado: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  adultos: z.number().int().min(1).optional(),
  criancasMeia: z.number().int().min(0).optional(),
  criancasIsento: z.number().int().min(0).optional(),
  criancasIntegral: z.number().int().min(0).optional(),
  valorPorPessoa: z.number().min(0).optional(),
  mesasUnificadas: z.boolean().optional(),
  observacoes: z.string().max(500).optional(),
  status: z.enum(['pendente', 'cancelou']).optional(),
})

function calcularTotal(adultos: number, criancasMeia: number, criancasIntegral: number, valorPorPessoa: number) {
  return (adultos + criancasIntegral) * valorPorPessoa + criancasMeia * VALOR_CRIANCA_MEIA
}

async function buscarReserva(id: string) {
  const [reserva] = await db.select().from(reservas).where(eq(reservas.id, id)).limit(1)
  return reserva ?? null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) return respostaErro('ID inválido', 400)

  const reserva = await buscarReserva(id)
  if (!reserva) return respostaErro('Reserva não encontrada', 404)

  return Response.json({ reserva })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) return respostaErro('ID inválido', 400)

  const reservaAtual = await buscarReserva(id)
  if (!reservaAtual) return respostaErro('Reserva não encontrada', 404)

  if (reservaAtual.status !== 'pendente') {
    return respostaErro('Apenas reservas pendentes podem ser alteradas', 422)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return respostaErro('Body inválido', 400)
  }

  const parsed = atualizarReservaSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ erro: 'Dados inválidos', campos: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const d = parsed.data
  const adultos = d.adultos ?? reservaAtual.adultos
  const criancasMeia = d.criancasMeia ?? reservaAtual.criancas50pct
  const criancasIntegral = d.criancasIntegral ?? reservaAtual.criancasIntegral
  const valorPorPessoa = d.valorPorPessoa ?? Number(reservaAtual.valorPorPessoa ?? 0)

  const valorTotal = valorPorPessoa > 0
    ? String(calcularTotal(adultos, criancasMeia, criancasIntegral, valorPorPessoa))
    : reservaAtual.valorTotal

  const [atualizada] = await db
    .update(reservas)
    .set({
      ...(d.nomeCliente !== undefined && { nomeCliente: d.nomeCliente }),
      ...(d.telefone !== undefined && { telefone: d.telefone }),
      ...(d.horarioReservado !== undefined && { horarioReservado: d.horarioReservado }),
      ...(d.adultos !== undefined && { adultos: d.adultos }),
      ...(d.criancasMeia !== undefined && { criancas50pct: d.criancasMeia }),
      ...(d.criancasIsento !== undefined && { criancasIsento: d.criancasIsento }),
      ...(d.criancasIntegral !== undefined && { criancasIntegral: d.criancasIntegral }),
      ...(d.valorPorPessoa !== undefined && { valorPorPessoa: String(d.valorPorPessoa) }),
      ...(d.mesasUnificadas !== undefined && { mesasUnificadas: d.mesasUnificadas }),
      ...(d.observacoes !== undefined && { observacoes: d.observacoes }),
      ...(d.status !== undefined && { status: d.status }),
      valorTotal,
      updatedAt: new Date(),
    })
    .where(eq(reservas.id, id))
    .returning()

  return Response.json({ reserva: atualizada })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) return respostaErro('ID inválido', 400)

  const reservaAtual = await buscarReserva(id)
  if (!reservaAtual) return respostaErro('Reserva não encontrada', 404)

  if (reservaAtual.status !== 'pendente') {
    return respostaErro('Apenas reservas pendentes podem ser canceladas', 422)
  }

  await db
    .update(reservas)
    .set({ status: 'cancelou', updatedAt: new Date() })
    .where(eq(reservas.id, id))

  return Response.json({ sucesso: true, mensagem: 'Reserva cancelada' })
}
