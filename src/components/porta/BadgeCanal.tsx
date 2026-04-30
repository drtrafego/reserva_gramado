import { Badge } from '@/components/ui/badge'
import type { CanalOrigem } from '@/lib/db/schema'

const config: Record<CanalOrigem, { label: string; className: string }> = {
  reserva: { label: 'Reserva', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  porta: { label: 'Porta', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  site: { label: 'Site', className: 'bg-purple-100 text-purple-800 border-purple-200' },
}

export function BadgeCanal({ canal }: { canal: CanalOrigem }) {
  const { label, className } = config[canal]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
