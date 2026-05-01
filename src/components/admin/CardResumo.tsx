import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  valor: string | number
  icone: React.ReactNode
  variante?: 'default' | 'hero' | 'danger' | 'warning'
  cor?: 'blue' | 'green' | 'red' | 'yellow' | 'emerald'
  subtitulo?: string
  className?: string
}

const iconesCores = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

export function CardResumo({ titulo, valor, icone, variante = 'default', cor = 'blue', subtitulo, className }: Props) {
  if (variante === 'hero') {
    return (
      <div className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200/60', className)}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-white">
          {icone}
        </div>
        <div>
          <p className="text-xs text-emerald-100 font-semibold uppercase tracking-widest">{titulo}</p>
          <p className="text-3xl font-bold text-white mt-1 leading-none">{valor}</p>
          {subtitulo && <p className="text-xs text-emerald-200 mt-2">{subtitulo}</p>}
        </div>
      </div>
    )
  }

  if (variante === 'danger') {
    return (
      <div className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-200/60', className)}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-white">
          {icone}
        </div>
        <div>
          <p className="text-xs text-red-100 font-semibold uppercase tracking-widest">{titulo}</p>
          <p className="text-2xl font-bold text-white mt-1 leading-none">{valor}</p>
          {subtitulo && <p className="text-xs text-red-200 mt-2">{subtitulo}</p>}
        </div>
      </div>
    )
  }

  if (variante === 'warning') {
    return (
      <div className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-200/60', className)}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-white">
          {icone}
        </div>
        <div>
          <p className="text-xs text-amber-100 font-semibold uppercase tracking-widest">{titulo}</p>
          <p className="text-2xl font-bold text-white mt-1 leading-none">{valor}</p>
          {subtitulo && <p className="text-xs text-amber-100 mt-2">{subtitulo}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm', className)}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconesCores[cor])}>
        {icone}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{titulo}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">{valor}</p>
        {subtitulo && <p className="text-xs text-gray-400 mt-2">{subtitulo}</p>}
      </div>
    </div>
  )
}
