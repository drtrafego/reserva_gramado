'use client'

import { useTransition, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Users, DollarSign, Pencil, Timer } from 'lucide-react'
import { BadgeCanal } from './BadgeCanal'
import { marcarNaoCompareceu } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva
  onConfirmar: (reserva: Reserva) => void
  onEditar: (reserva: Reserva) => void
  tempoPermanenciaMin?: number
  tempoPermanenciaUnificadaMin?: number
  limitePessoasGrupoGrande?: number
}

function fmtBRL(v: string | null | undefined) {
  if (!v) return null
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcularMinutosRestantes(
  horarioChegada: string,
  duracao: number
): number {
  const agora = new Date()
  const [h, m] = horarioChegada.split(':').map(Number)
  const chegada = new Date(agora)
  chegada.setHours(h, m, 0, 0)
  const saida = new Date(chegada.getTime() + duracao * 60 * 1000)
  return Math.ceil((saida.getTime() - agora.getTime()) / 60000)
}

function CountdownTimer({
  horarioChegada,
  duracao,
}: {
  horarioChegada: string
  duracao: number
}) {
  const [minutos, setMinutos] = useState(() =>
    calcularMinutosRestantes(horarioChegada, duracao)
  )

  useEffect(() => {
    const tick = setInterval(() => {
      setMinutos(calcularMinutosRestantes(horarioChegada, duracao))
    }, 30000)
    return () => clearInterval(tick)
  }, [horarioChegada, duracao])

  if (minutos <= 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
        <Timer className="w-3 h-3" />
        Mesa liberada
      </span>
    )
  }

  const cor = minutos <= 15
    ? 'text-red-600 bg-red-50 border-red-200'
    : minutos <= 30
    ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-emerald-600 bg-emerald-50 border-emerald-200'

  return (
    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${cor}`}>
      <Timer className="w-3 h-3" />
      {minutos} min restantes
    </span>
  )
}

export function CardReserva({
  reserva,
  onConfirmar,
  onEditar,
  tempoPermanenciaMin = 90,
  tempoPermanenciaUnificadaMin = 120,
  limitePessoasGrupoGrande = 5,
}: Props) {
  const [pending, startTransition] = useTransition()
  const isPendente = reserva.status === 'pendente'
  const chegou = reserva.status === 'compareceu'
  const naoVeio = reserva.status === 'nao_compareceu'
  const totalPessoas = reserva.adultos + reserva.criancas50pct + reserva.criancasIsento + reserva.criancasIntegral
  const pessoas = reserva.pessoasChegada ?? totalPessoas
  const duracao = pessoas >= limitePessoasGrupoGrande ? tempoPermanenciaUnificadaMin : tempoPermanenciaMin

  function handleNaoCompareceu() {
    startTransition(async () => {
      await marcarNaoCompareceu(reserva.id)
      toast.success('Marcado como não compareceu')
    })
  }

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all ${
      chegou ? 'border-emerald-200 bg-emerald-50' :
      naoVeio ? 'border-gray-100 bg-gray-50 opacity-55' :
      'border-gray-200 bg-white shadow-sm'
    }`}>
      <div className={`h-1.5 w-full ${
        chegou ? 'bg-emerald-500' :
        naoVeio ? 'bg-gray-300' :
        reserva.canalOrigem === 'porta' ? 'bg-orange-400' :
        reserva.canalOrigem === 'site' ? 'bg-violet-500' :
        'bg-emerald-600'
      }`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-lg leading-tight truncate ${naoVeio ? 'text-gray-400' : 'text-gray-900'}`}>
                {reserva.nomeCliente ?? 'Entrada direta'}
              </p>
              {chegou && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Confirmado
                </span>
              )}
              {reserva.mesasUnificadas && (
                <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Mesa unificada
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {reserva.horarioReservado && (
                <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {reserva.horarioReservado}
                </span>
              )}
              {reserva.horarioChegada && chegou && (
                <span className="text-xs text-emerald-600 font-medium">chegou {reserva.horarioChegada}</span>
              )}
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                {totalPessoas} pax
                {reserva.pessoasChegada && reserva.pessoasChegada !== totalPessoas && (
                  <span className="text-amber-600 ml-1">→ {reserva.pessoasChegada}</span>
                )}
              </span>
              {fmtBRL(reserva.valorTotal) && (
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5" />
                  {fmtBRL(reserva.valorTotal)}
                </span>
              )}
            </div>
            {reserva.telefone && (
              <p className="text-xs text-gray-400 mt-1">{reserva.telefone}</p>
            )}
            {chegou && reserva.horarioChegada && (
              <div className="mt-2">
                <CountdownTimer horarioChegada={reserva.horarioChegada} duracao={duracao} />
              </div>
            )}
          </div>
          <div className="shrink-0 flex items-start gap-2">
            <BadgeCanal canal={reserva.canalOrigem} />
            <button
              onClick={() => onEditar(reserva)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {reserva.observacoes && (
          <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
            {reserva.observacoes}
          </p>
        )}

        {isPendente && (
          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold rounded-xl"
              onClick={() => onConfirmar(reserva)}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar chegada
            </Button>
            <Button
              variant="outline"
              className="w-12 border-red-200 text-red-500 hover:bg-red-50 h-12 rounded-xl"
              onClick={handleNaoCompareceu}
              disabled={pending}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
