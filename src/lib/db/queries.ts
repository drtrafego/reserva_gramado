import { eq, and, sql, gte, lte, desc } from 'drizzle-orm'
import { db } from './index'
import { reservas, restauranteConfig } from './schema'
import type { StatusReserva } from './schema'

export async function getReservasDoDia(data: string) {
  return db
    .select()
    .from(reservas)
    .where(eq(reservas.data, data))
    .orderBy(reservas.horarioReservado, reservas.createdAt)
}

export async function getReservasDoDiaComFiltro(data: string, status?: StatusReserva) {
  if (status) {
    return db
      .select()
      .from(reservas)
      .where(and(eq(reservas.data, data), eq(reservas.status, status)))
      .orderBy(reservas.horarioReservado, reservas.createdAt)
  }
  return getReservasDoDia(data)
}

export async function getTodasReservas(limite = 50, offset = 0) {
  return db
    .select()
    .from(reservas)
    .orderBy(desc(reservas.data), reservas.horarioReservado)
    .limit(limite)
    .offset(offset)
}

export async function getConfig() {
  const rows = await db.select().from(restauranteConfig).limit(1)
  return rows[0] ?? null
}

export async function getCapacidadeOcupada(data: string) {
  const result = await db
    .select({
      total: sql<number>`coalesce(sum(${reservas.adultos} + ${reservas.criancas50pct} + ${reservas.criancasIsento}), 0)`,
    })
    .from(reservas)
    .where(and(eq(reservas.data, data), eq(reservas.status, 'pendente')))
  return Number(result[0]?.total ?? 0)
}

export async function getResumoDoDia(data: string) {
  const rows = await db.select().from(reservas).where(eq(reservas.data, data))
  const total = rows.length
  const compareceu = rows.filter((r) => r.status === 'compareceu').length
  const naoCompareceu = rows.filter((r) => r.status === 'nao_compareceu').length
  const pendente = rows.filter((r) => r.status === 'pendente').length
  const pessoasEsperadas = rows.reduce(
    (acc, r) => acc + r.adultos + r.criancas50pct + r.criancasIsento,
    0
  )
  const receitaGerada = rows
    .filter((r) => r.status === 'compareceu')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)
  return { total, compareceu, naoCompareceu, pendente, pessoasEsperadas, receitaGerada }
}

export async function getRelatorioMensal(ano: number, mes: number) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fim = `${ano}-${String(mes).padStart(2, '0')}-31`

  const rows = await db
    .select()
    .from(reservas)
    .where(and(gte(reservas.data, inicio), lte(reservas.data, fim)))

  const totalReservas = rows.length
  const compareceram = rows.filter((r) => r.status === 'compareceu').length
  const naoCompareceram = rows.filter((r) => r.status === 'nao_compareceu').length
  const pendentes = rows.filter((r) => r.status === 'pendente').length

  const receitaTotal = rows
    .filter((r) => r.status === 'compareceu')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)

  const receitaPerdida = rows
    .filter((r) => r.status === 'nao_compareceu')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)

  const porCanal = {
    reserva: rows.filter((r) => r.canalOrigem === 'reserva').length,
    porta: rows.filter((r) => r.canalOrigem === 'porta').length,
    site: rows.filter((r) => r.canalOrigem === 'site').length,
  }

  const receitaPorCanal = {
    reserva: rows
      .filter((r) => r.canalOrigem === 'reserva' && r.status === 'compareceu')
      .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0),
    porta: rows
      .filter((r) => r.canalOrigem === 'porta' && r.status === 'compareceu')
      .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0),
    site: rows
      .filter((r) => r.canalOrigem === 'site' && r.status === 'compareceu')
      .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0),
  }

  const horariosPico: Record<string, number> = {}
  rows.forEach((r) => {
    if (r.horarioReservado) {
      const hora = r.horarioReservado.substring(0, 5)
      horariosPico[hora] = (horariosPico[hora] ?? 0) + 1
    }
  })
  const horariosPicoOrdenados = Object.entries(horariosPico)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hora, qtd]) => ({ hora, qtd }))

  const porDia: Record<string, { compareceu: number; nao_compareceu: number; receita: number }> = {}
  rows.forEach((r) => {
    if (!porDia[r.data]) porDia[r.data] = { compareceu: 0, nao_compareceu: 0, receita: 0 }
    if (r.status === 'compareceu') {
      porDia[r.data].compareceu++
      porDia[r.data].receita += Number(r.valorTotal ?? 0)
    }
    if (r.status === 'nao_compareceu') porDia[r.data].nao_compareceu++
  })
  const graficosDia = Object.entries(porDia)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, vals]) => ({ data: data.slice(8, 10), ...vals }))

  return {
    totalReservas,
    compareceram,
    naoCompareceram,
    pendentes,
    receitaTotal,
    receitaPerdida,
    porCanal,
    receitaPorCanal,
    horariosPico: horariosPicoOrdenados,
    graficosDia,
    rows,
  }
}
