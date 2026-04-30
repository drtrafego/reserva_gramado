import { FormNovaReserva } from '@/components/admin/FormNovaReserva'

export default function NovaReservaPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Reserva</h1>
        <p className="text-sm text-gray-500">Cadastre manualmente uma reserva</p>
      </div>
      <FormNovaReserva />
    </div>
  )
}
