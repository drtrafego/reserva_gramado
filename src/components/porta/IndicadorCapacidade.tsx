'use client'

import { Progress } from '@/components/ui/progress'
import { Users } from 'lucide-react'

interface Props {
  ocupadas: number
  capacidade: number
  alerta: number
}

export function IndicadorCapacidade({ ocupadas, capacidade, alerta }: Props) {
  const pct = Math.min(Math.round((ocupadas / capacidade) * 100), 100)
  const emAlerta = pct >= alerta

  return (
    <div className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
      <Users className={`w-5 h-5 ${emAlerta ? 'text-red-500' : 'text-gray-500'}`} />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Capacidade</span>
          <span className={`font-semibold ${emAlerta ? 'text-red-600' : 'text-gray-600'}`}>
            {ocupadas} de {capacidade} pessoas
          </span>
        </div>
        <Progress
          value={pct}
          className={`h-2 ${emAlerta ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
        />
      </div>
      {emAlerta && (
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
          Atenção
        </span>
      )}
    </div>
  )
}
