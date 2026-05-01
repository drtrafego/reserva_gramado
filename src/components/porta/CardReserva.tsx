'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Users, DollarSign } from 'lucide-react'
import { BadgeCanal } from './BadgeCanal'
import { marcarNaoCompareceu } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva
  onConfirmar: (reserva: Reserva) => void
}

function fmtBRL(v: string | null | undefined) {
  if (!v) return null
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CardReserva({ reserva, onConfirmar }: Props) {
  const [pending, startTransition] = useTransition()
  const isPendente = reserva.status === 'pendente'
  const chegou = reserva.status === 'compareceu'
  const naoVeio = reserva.status === 'nao_compareceu'
  const totalPessoas = reserva.adultos + reserva.criancas50pct + reserva.criancasIsento

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
      {/* Status bar top */}
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
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {reserva.horarioReservado && (
                <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {reserva.horarioReservado}
                </span>
              )}
              {reserva.horarioChegada && chegou && (
                <span className="text-xs text-emerald-600 font-medium">
                  chegou {reserva.horarioChegada}
                </span>
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
          </div>
          <div className="shrink-0">
            <BadgeCanal canal={reserva.canalOrigem} />
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
              className="w-24 border-red-200 text-red-500 hover:bg-red-50 h-12 text-sm rounded-xl"
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
