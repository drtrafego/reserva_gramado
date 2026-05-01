'use client'

import { Users, AlertTriangle } from 'lucide-react'

interface Props {
  ocupadas: number
  capacidade: number
  alerta: number
}

export function IndicadorCapacidade({ ocupadas, capacidade, alerta }: Props) {
  const pct = Math.min(Math.round((ocupadas / capacidade) * 100), 100)
  const livres = capacidade - ocupadas
  const emAlerta = pct >= alerta
  const critico = pct >= 95

  const cor = critico
    ? { barra: 'bg-red-500', texto: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700' }
    : emAlerta
    ? { barra: 'bg-amber-500', texto: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' }
    : { barra: 'bg-emerald-500', texto: 'text-emerald-600', bg: 'bg-white border-gray-200', badge: 'bg-emerald-100 text-emerald-700' }

  return (
    <div className={`border rounded-2xl p-4 ${cor.bg}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${emAlerta ? (critico ? 'bg-red-100' : 'bg-amber-100') : 'bg-emerald-100'}`}>
            {emAlerta
              ? <AlertTriangle className={`w-7 h-7 ${cor.texto}`} />
              : <Users className="w-7 h-7 text-emerald-600" />
            }
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Capacidade</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-4xl font-black ${cor.texto}`}>{ocupadas}</span>
              <span className="text-lg text-gray-400 font-medium">/ {capacidade}</span>
              <span className="text-sm text-gray-400">pessoas</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-black ${cor.texto}`}>{pct}%</div>
          <div className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-lg ${cor.badge}`}>
            {livres > 0 ? `${livres} livres` : 'Lotado'}
          </div>
        </div>
      </div>
      <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cor.barra}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
