'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'
import {
  confirmarChegadaSchema,
  entradaPortaSchema,
  novaReservaSchema,
  editarReservaSchema,
} from '@/lib/validations/reserva'
import { format } from 'date-fns'

function calcularTotal(adultos: number, criancas50: number, valorPorPessoa: number) {
  return adultos * valorPorPessoa + criancas50 * (valorPorPessoa * 0.5)
}

export async function confirmarChegada(formData: FormData) {
  const raw = {
    id: formData.get('id'),
    pessoasChegada: formData.get('pessoasChegada'),
    horarioChegada: formData.get('horarioChegada') || format(new Date(), 'HH:mm'),
    observacoes: formData.get('observacoes'),
  }

  const parsed = confirmarChegadaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  await db
    .update(reservas)
    .set({
      status: 'compareceu',
      pessoasChegada: parsed.data.pessoasChegada,
      horarioChegada: parsed.data.horarioChegada ?? format(new Date(), 'HH:mm'),
      observacoes: parsed.data.observacoes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(reservas.id, parsed.data.id))

  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}

export async function marcarNaoCompareceu(id: string) {
  await db
    .update(reservas)
    .set({ status: 'nao_compareceu', updatedAt: new Date() })
    .where(eq(reservas.id, id))

  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}

export async function registrarEntradaPorta(formData: FormData) {
  const raw = {
    nomeCliente: formData.get('nomeCliente'),
    adultos: formData.get('adultos'),
    criancas50pct: formData.get('criancas50pct') ?? '0',
    criancasIsento: formData.get('criancasIsento') ?? '0',
    valorPorPessoa: formData.get('valorPorPessoa'),
    observacoes: formData.get('observacoes'),
  }

  const parsed = entradaPortaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { adultos, criancas50pct, criancasIsento, valorPorPessoa } = parsed.data
  const total = valorPorPessoa ? calcularTotal(adultos, criancas50pct, valorPorPessoa) : null
  const agora = new Date()

  await db.insert(reservas).values({
    data: format(agora, 'yyyy-MM-dd'),
    nomeCliente: parsed.data.nomeCliente || null,
    adultos,
    criancas50pct,
    criancasIsento,
    pessoasChegada: adultos + criancas50pct + criancasIsento,
    horarioChegada: format(agora, 'HH:mm'),
    valorPorPessoa: valorPorPessoa ? String(valorPorPessoa) : null,
    valorTotal: total ? String(total) : null,
    canalOrigem: 'porta',
    status: 'compareceu',
    observacoes: parsed.data.observacoes ?? null,
  })

  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}

export async function criarReserva(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = novaReservaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { adultos, criancas50pct, criancasIsento, valorPorPessoa } = parsed.data
  const total = calcularTotal(adultos, criancas50pct ?? 0, valorPorPessoa)

  await db.insert(reservas).values({
    data: parsed.data.data,
    nomeCliente: parsed.data.nomeCliente,
    telefone: parsed.data.telefone ?? null,
    horarioReservado: parsed.data.horarioReservado,
    adultos,
    criancas50pct: criancas50pct ?? 0,
    criancasIsento: criancasIsento ?? 0,
    valorPorPessoa: String(valorPorPessoa),
    valorTotal: String(total),
    canalOrigem: parsed.data.canalOrigem,
    status: 'pendente',
    observacoes: parsed.data.observacoes ?? null,
  })

  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}

export async function editarReserva(formData: FormData) {
  const raw = {
    id: formData.get('id'),
    nomeCliente: formData.get('nomeCliente'),
    telefone: formData.get('telefone') || undefined,
    horarioReservado: formData.get('horarioReservado') || undefined,
    adultos: formData.get('adultos'),
    criancas50pct: formData.get('criancas50pct') ?? '0',
    criancasIsento: formData.get('criancasIsento') ?? '0',
    valorPorPessoa: formData.get('valorPorPessoa') || undefined,
    observacoes: formData.get('observacoes') || undefined,
  }

  const parsed = editarReservaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { adultos, criancas50pct, criancasIsento, valorPorPessoa } = parsed.data
  const valorTotal = valorPorPessoa
    ? calcularTotal(adultos, criancas50pct, valorPorPessoa)
    : null

  await db
    .update(reservas)
    .set({
      nomeCliente: parsed.data.nomeCliente,
      telefone: parsed.data.telefone ?? null,
      horarioReservado: parsed.data.horarioReservado ?? null,
      adultos,
      criancas50pct,
      criancasIsento,
      valorPorPessoa: valorPorPessoa ? String(valorPorPessoa) : null,
      valorTotal: valorTotal ? String(valorTotal) : null,
      observacoes: parsed.data.observacoes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(reservas.id, parsed.data.id))

  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}

export async function marcarNaoCompareceuEmLote(ids: string[]) {
  await Promise.all(
    ids.map((id) =>
      db
        .update(reservas)
        .set({ status: 'nao_compareceu', updatedAt: new Date() })
        .where(eq(reservas.id, id))
    )
  )
  revalidatePath('/porta')
  revalidatePath('/admin')
  return { success: true }
}
