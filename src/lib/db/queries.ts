import { eq, and, sql, gte, lte, desc } from 'drizzle-orm'
import { db } from './index'
import { reservas, restauranteConfig, ambientes, tiposMesa } from './schema'
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
      total: sql<number>`coalesce(sum(${reservas.adultos} + ${reservas.criancas50pct} + ${reservas.criancasIsento} + ${reservas.criancasIntegral}), 0)`,
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
    (acc, r) => acc + r.adultos + r.criancas50pct + r.criancasIsento + r.criancasIntegral,
    0
  )
  const receitaGerada = rows
    .filter((r) => r.status === 'compareceu')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)
  const receitaPerdida = rows
    .filter((r) => r.status === 'nao_compareceu')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)
  const receitaPotencial = rows
    .filter((r) => r.status === 'pendente')
    .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0)
  return { total, compareceu, naoCompareceu, pendente, pessoasEsperadas, receitaGerada, receitaPerdida, receitaPotencial }
}

export async function getAmbientes() {
  const lista = await db.select().from(ambientes).orderBy(ambientes.nome)
  const mesas = await db.select().from(tiposMesa)
  return lista.map((a) => ({
    ...a,
    tiposMesa: mesas.filter((m) => m.ambienteId === a.id),
  }))
}

export async function getCapacidadeSimultanea(): Promise<number> {
  const mesas = await db
    .select({ capacidade: tiposMesa.capacidade, quantidade: tiposMesa.quantidade })
    .from(tiposMesa)
    .innerJoin(ambientes, eq(tiposMesa.ambienteId, ambientes.id))
    .where(eq(ambientes.ativo, true))
  return mesas.reduce((sum, m) => sum + m.capacidade * m.quantidade, 0)
}

export async function getSlotsDisponiveis(data: string, pessoas: number) {
  const config = await getConfig()
  if (!config) return []

  const capacidadeSimultanea = await getCapacidadeSimultanea()
  const limiteDiario = config.capacidadeEfetiva

  const reservasDoDia = await db
    .select({
      horarioReservado: reservas.horarioReservado,
      adultos: reservas.adultos,
      criancas50pct: reservas.criancas50pct,
      criancasIsento: reservas.criancasIsento,
      criancasIntegral: reservas.criancasIntegral,
      mesasUnificadas: reservas.mesasUnificadas,
      status: reservas.status,
    })
    .from(reservas)
    .where(and(eq(reservas.data, data), eq(reservas.status, 'pendente')))

  const totalDiario = reservasDoDia.reduce(
    (s, r) => s + r.adultos + r.criancas50pct + r.criancasIsento + r.criancasIntegral,
    0
  )

  const [inicioH, inicioM] = config.horarioInicio.split(':').map(Number)
  const [fimH, fimM] = config.horarioFim.split(':').map(Number)
  const inicioMin = inicioH * 60 + inicioM
  const fimMin = fimH * 60 + fimM
  const duracao = config.tempoPermanenciaMin
  const duracaoMaxima = Math.max(config.tempoPermanenciaMin, config.tempoPermanenciaUnificadaMin)
  const intervalo = config.intervaloSlotMin

  function minToHH(min: number) {
    const h = Math.floor(min / 60).toString().padStart(2, '0')
    const m = (min % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  const slots = []
  for (let t = inicioMin; t + duracaoMaxima <= fimMin; t += intervalo) {
    const horario = minToHH(t)

    const ocupadosNoSlot = reservasDoDia.reduce((s, r) => {
      if (!r.horarioReservado) return s
      const [rH, rM] = r.horarioReservado.split(':').map(Number)
      const rMin = rH * 60 + rM
      const rDur = r.mesasUnificadas ? config.tempoPermanenciaUnificadaMin : duracao
      if (rMin < t + duracao && t < rMin + rDur) {
        return s + r.adultos + r.criancas50pct + r.criancasIsento + r.criancasIntegral
      }
      return s
    }, 0)

    const vagasSimultaneas = capacidadeSimultanea > 0
      ? Math.max(0, capacidadeSimultanea - ocupadosNoSlot)
      : Math.max(0, limiteDiario - totalDiario)

    const vagasDiarias = Math.max(0, limiteDiario - totalDiario)
    const vagas = Math.min(vagasSimultaneas, vagasDiarias)

    slots.push({
      horario,
      disponivel: vagas >= pessoas,
      vagasRestantes: vagas,
      ocupados: ocupadosNoSlot,
    })
  }

  return slots
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
    whatsapp: rows.filter((r) => r.canalOrigem === 'whatsapp').length,
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
    whatsapp: rows
      .filter((r) => r.canalOrigem === 'whatsapp' && r.status === 'compareceu')
      .reduce((acc, r) => acc + Number(r.valorTotal ?? 0), 0),
  }

  const horariosPico: Record<string, number> = {}
  rows.forEach((r) => {
    const hora = r.horarioReservado ? r.horarioReservado.substring(0, 5) : r.horarioChegada ? r.horarioChegada.substring(0, 5) : null
    if (hora) horariosPico[hora] = (horariosPico[hora] ?? 0) + 1
  })
  const horariosPicoOrdenados = Object.entries(horariosPico)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hora, qtd]) => ({ hora, qtd }))

  function topicoHorariosPorCanal(canal: 'reserva' | 'porta' | 'site' | 'whatsapp') {
    const mapa: Record<string, number> = {}
    rows
      .filter((r) => r.canalOrigem === canal)
      .forEach((r) => {
        const hora = r.horarioReservado ? r.horarioReservado.substring(0, 5) : r.horarioChegada ? r.horarioChegada.substring(0, 5) : null
        if (hora) mapa[hora] = (mapa[hora] ?? 0) + 1
      })
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hora, qtd]) => ({ hora, qtd }))
  }

  const horariosPicoPorCanal = {
    reserva: topicoHorariosPorCanal('reserva'),
    porta: topicoHorariosPorCanal('porta'),
    site: topicoHorariosPorCanal('site'),
    whatsapp: topicoHorariosPorCanal('whatsapp'),
  }

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
    horariosPicoPorCanal,
    graficosDia,
    rows,
  }
}
