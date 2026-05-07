import Link from 'next/link'
import { getTodasReservas } from '@/lib/db/queries'
import { BadgeCanal } from '@/components/porta/BadgeCanal'
import { BadgeStatus } from '@/components/porta/BadgeStatus'
import { PlusCircle } from 'lucide-react'
import { BotaoWhatsApp } from '@/components/admin/BotaoWhatsApp'

export const dynamic = 'force-dynamic'

function fmt(v: string | null | undefined) {
  if (!v) return '-'
  return `R$ ${Number(v).toFixed(2).replace('.', ',')}`
}

function fmtData(d: string) {
  try {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  } catch {
    return d
  }
}

export default async function ReservasPage() {
  const reservas = await getTodasReservas(100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-500">Últimas 100 reservas</p>
        </div>
        <Link
          href="/admin/reservas/nova"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nova Reserva
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 font-medium">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Pessoas</th>
                <th className="px-4 py-3">Valor/pax</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtData(r.data)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{r.nomeCliente ?? 'Sem nome'}</p>
                    {r.telefone && <p className="text-xs text-gray-400">{r.telefone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.horarioReservado ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {r.adultos}A
                    {r.criancas50pct > 0 && ` + ${r.criancas50pct} Meia`}
                    {r.criancasIsento > 0 && ` + ${r.criancasIsento} Cortesia`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(r.valorPorPessoa)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{fmt(r.valorTotal)}</td>
                  <td className="px-4 py-3"><BadgeCanal canal={r.canalOrigem} /></td>
                  <td className="px-4 py-3"><BadgeStatus status={r.status} /></td>
                  <td className="px-4 py-3">
                    <BotaoWhatsApp reserva={r} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.observacoes ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reservas.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhuma reserva encontrada</div>
          )}
        </div>
      </div>
    </div>
  )
}
