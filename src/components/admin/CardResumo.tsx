import { cn } from '@/lib/utils'

const cores = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

interface Props {
  titulo: string
  valor: string | number
  icone: React.ReactNode
  cor: keyof typeof cores
  className?: string
}

export function CardResumo({ titulo, valor, icone, cor, className }: Props) {
  return (
    <div className={cn('bg-white rounded-xl border p-4 flex flex-col gap-2', className)}>
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border', cores[cor])}>
        {icone}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{titulo}</p>
        <p className="text-xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  )
}
