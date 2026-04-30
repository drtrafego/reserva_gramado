import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getReservasDoDia, getConfig, getCapacidadeOcupada } from '@/lib/db/queries'
import { PainelPorta } from '@/components/porta/PainelPorta'

export const dynamic = 'force-dynamic'

export default async function PortaPage() {
  const hoje = format(new Date(), 'yyyy-MM-dd')
  const dataFormatada = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  const [reservas, config, capacidadeOcupada] = await Promise.all([
    getReservasDoDia(hoje),
    getConfig(),
    getCapacidadeOcupada(hoje),
  ])

  const capacidadeEfetiva = config?.capacidadeEfetiva ?? 70
  const alertaPct = config?.alertaCapacidadePct ?? 85

  return (
    <PainelPorta
      reservas={reservas}
      capacidadeOcupada={capacidadeOcupada}
      capacidadeEfetiva={capacidadeEfetiva}
      alertaPct={alertaPct}
      dataFormatada={dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}
    />
  )
}
