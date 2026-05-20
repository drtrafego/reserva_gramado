'use client'

import { useTransition, useState } from 'react'
import { BadgeCanal } from '@/components/porta/BadgeCanal'
import { BadgeStatus } from '@/components/porta/BadgeStatus'
import { marcarNaoCompareceuEmLote } from '@/lib/actions/reservas'
import { ModalEditarReserva } from '@/components/porta/ModalEditarReserva'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

function fmt(v: string | null | undefined) {
  if (!v) return '-'
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

export function TabelaReservasHoje({ reservas }: { reservas: Reserva[] }) {
  const [pending, startTransition] = useTransition()
  const [reservaEditando, setReservaEditando] = useState<Reserva | null>(null)
  const pendentes = reservas.filter((r) => r.status === 'pendente')

  function handleNoShowLote() {
    startTransition(async () => {
      await marcarNaoCompareceuEmLote(pendentes.map((r) => r.id))
      toast.success(`${pendentes.length} reserva(s) marcadas como não compareceu`)
    })
  }

  if (reservas.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
        <p className="font-medium">Nenhuma reserva para hoje</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Reservas de Hoje ({reservas.length})</h2>
          {pendentes.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleNoShowLote}
              disabled={pending}
            >
              Marcar {pendentes.length} como não vieram
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 font-medium">
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Horário</th>
                <th className="px-4 py-2">Pessoas</th>
                <th className="px-4 py-2">Canal</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.nomeCliente ?? 'Sem nome'}</p>
                    {r.telefone && <p className="text-xs text-gray-400">{r.telefone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.horarioReservado ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.adultos}A
                    {r.criancasIntegral > 0 && ` + ${r.criancasIntegral} Int`}
                    {r.criancas50pct > 0 && ` + ${r.criancas50pct} Meia`}
                    {r.criancasIsento > 0 && ` + ${r.criancasIsento} Cortesia`}
                  </td>
                  <td className="px-4 py-3"><BadgeCanal canal={r.canalOrigem} /></td>
                  <td className="px-4 py-3 font-medium text-gray-700">{fmt(r.valorTotal)}</td>
                  <td className="px-4 py-3"><BadgeStatus status={r.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setReservaEditando(r)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalEditarReserva
        reserva={reservaEditando}
        open={!!reservaEditando}
        onClose={() => setReservaEditando(null)}
      />
    </>
  )
}
