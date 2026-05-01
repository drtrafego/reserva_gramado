import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getResumoDoDia, getReservasDoDia } from '@/lib/db/queries'
import { CardResumo } from '@/components/admin/CardResumo'
import { TabelaReservasHoje } from '@/components/admin/TabelaReservasHoje'
import { Users, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminPage() {
  const hoje = format(new Date(), 'yyyy-MM-dd')
  const dataExibida = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const [resumo, reservasHoje] = await Promise.all([
    getResumoDoDia(hoje),
    getReservasDoDia(hoje),
  ])

  const taxaPresenca =
    resumo.compareceu + resumo.naoCompareceu > 0
      ? Math.round((resumo.compareceu / (resumo.compareceu + resumo.naoCompareceu)) * 100)
      : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 capitalize">{dataExibida}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardResumo
          variante="hero"
          titulo="Receita de hoje"
          valor={fmtBRL(resumo.receitaGerada)}
          icone={<TrendingUp className="w-5 h-5" />}
          subtitulo={`${resumo.compareceu} reserva(s) confirmada(s)`}
        />
        <CardResumo
          variante="danger"
          titulo="Valor perdido"
          valor={fmtBRL(resumo.receitaPerdida)}
          icone={<TrendingDown className="w-5 h-5" />}
          subtitulo={`${resumo.naoCompareceu} no-show(s) hoje`}
        />
        <CardResumo
          variante="warning"
          titulo="Em risco (pendentes)"
          valor={fmtBRL(resumo.receitaPotencial)}
          icone={<AlertCircle className="w-5 h-5" />}
          subtitulo={`${resumo.pendente} reserva(s) aguardando`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CardResumo
          titulo="Total hoje"
          valor={resumo.total}
          icone={<Users className="w-5 h-5" />}
          cor="blue"
          subtitulo={`${resumo.pessoasEsperadas} pessoas`}
        />
        <CardResumo
          titulo="Confirmados"
          valor={resumo.compareceu}
          icone={<CheckCircle className="w-5 h-5" />}
          cor="green"
          subtitulo={taxaPresenca !== null ? `${taxaPresenca}% de presença` : undefined}
        />
        <CardResumo
          titulo="Não vieram"
          valor={resumo.naoCompareceu}
          icone={<XCircle className="w-5 h-5" />}
          cor="red"
        />
        <CardResumo
          titulo="Aguardando"
          valor={resumo.pendente}
          icone={<Clock className="w-5 h-5" />}
          cor="yellow"
        />
      </div>

      <TabelaReservasHoje reservas={reservasHoje} />
    </div>
  )
}
