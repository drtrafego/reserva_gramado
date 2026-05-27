import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getReservasDoDia, getConfig, getCapacidadeOcupada } from '@/lib/db/queries'
import { PainelPorta } from '@/components/porta/PainelPorta'
import { dataHojeBR } from '@/lib/tz'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ data?: string }>
}

export default async function PortaPage({ searchParams }: Props) {
  const params = await searchParams
  const hoje = dataHojeBR()

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

  const capacidadeEfetiva = config?.capacidadeEfetiva ?? 130
  const alertaPct = config?.alertaCapacidadePct ?? 85
  const tempoPermanenciaMin = config?.tempoPermanenciaMin ?? 90
  const tempoPermanenciaUnificadaMin = config?.tempoPermanenciaUnificadaMin ?? 120

  return (
    <PainelPorta
      reservas={reservas}
      capacidadeOcupada={capacidadeOcupada}
      capacidadeEfetiva={capacidadeEfetiva}
      alertaPct={alertaPct}
      dataFormatada={dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)}
      dataSelecionada={dataValida}
      isHoje={isHoje}
      tempoPermanenciaMin={tempoPermanenciaMin}
      tempoPermanenciaUnificadaMin={tempoPermanenciaUnificadaMin}
    />
  )
}
