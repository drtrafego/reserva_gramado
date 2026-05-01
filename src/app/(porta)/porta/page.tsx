import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getReservasDoDia, getConfig, getCapacidadeOcupada } from '@/lib/db/queries'
import { PainelPorta } from '@/components/porta/PainelPorta'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ data?: string }>
}

export default async function PortaPage({ searchParams }: Props) {
  const params = await searchParams
  const hoje = format(new Date(), 'yyyy-MM-dd')

  const dataParam = params.data ?? hoje
  const dataValida = (() => {
    try {
      const d = parseISO(dataParam)
      return isValid(d) ? dataParam : hoje
    } catch {
      return hoje
    }
  })()

  const dataObj = parseISO(dataValida)
  const dataFormatada = format(dataObj, "EEEE, dd 'de' MMMM", { locale: ptBR })
  const isHoje = dataValida === hoje

  const [reservas, config, capacidadeOcupada] = await Promise.all([
    getReservasDoDia(dataValida),
    getConfig(),
    getCapacidadeOcupada(dataValida),
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
      dataSelecionada={dataValida}
      isHoje={isHoje}
    />
  )
}
