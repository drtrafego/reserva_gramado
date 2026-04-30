import { Badge } from '@/components/ui/badge'
import type { StatusReserva } from '@/lib/db/schema'

const config: Record<StatusReserva, { label: string; className: string }> = {
  pendente: { label: 'Aguardando', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  compareceu: { label: 'Chegou', className: 'bg-green-100 text-green-800 border-green-200' },
  nao_compareceu: { label: 'Não veio', className: 'bg-red-100 text-red-800 border-red-200' },
  cancelou: { label: 'Cancelou', className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export function BadgeStatus({ status }: { status: StatusReserva }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
