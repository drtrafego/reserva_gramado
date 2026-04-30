'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { BadgeCanal } from './BadgeCanal'
import { BadgeStatus } from './BadgeStatus'
import { marcarNaoCompareceu } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva
  onConfirmar: (reserva: Reserva) => void
}

export function CardReserva({ reserva, onConfirmar }: Props) {
  const [pending, startTransition] = useTransition()
  const isPendente = reserva.status === 'pendente'

  function handleNaoCompareceu() {
    startTransition(async () => {
      await marcarNaoCompareceu(reserva.id)
      toast.success('Marcado como não compareceu')
    })
  }

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-all ${
        reserva.status === 'compareceu'
          ? 'border-green-200 bg-green-50/50'
          : reserva.status === 'nao_compareceu'
          ? 'border-red-100 opacity-60'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-base truncate">
            {reserva.nomeCliente ?? 'Sem nome'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {reserva.horarioReservado && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {reserva.horarioReservado}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {reserva.adultos + reserva.criancas50pct + reserva.criancasIsento} pax
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <BadgeStatus status={reserva.status} />
          <BadgeCanal canal={reserva.canalOrigem} />
        </div>
      </div>

      {reserva.observacoes && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
          {reserva.observacoes}
        </p>
      )}

      {isPendente && (
        <div className="flex gap-2 mt-1">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-base"
            onClick={() => onConfirmar(reserva)}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-11 text-base"
            onClick={handleNaoCompareceu}
            disabled={pending}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Não veio
          </Button>
        </div>
      )}
    </div>
  )
}
