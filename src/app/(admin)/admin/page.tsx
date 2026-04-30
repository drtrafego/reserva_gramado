import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getResumoDoDia, getReservasDoDia } from '@/lib/db/queries'
import { CardResumo } from '@/components/admin/CardResumo'
import { TabelaReservasHoje } from '@/components/admin/TabelaReservasHoje'
import { Users, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const hoje = format(new Date(), 'yyyy-MM-dd')
  const dataExibida = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const [resumo, reservasHoje] = await Promise.all([
    getResumoDoDia(hoje),
    getReservasDoDia(hoje),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 capitalize">{dataExibida}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <CardResumo
          titulo="Total hoje"
          valor={resumo.total}
          icone={<Users className="w-5 h-5" />}
          cor="blue"
        />
        <CardResumo
          titulo="Confirmados"
          valor={resumo.compareceu}
          icone={<CheckCircle className="w-5 h-5" />}
          cor="green"
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
        <CardResumo
          titulo="Receita hoje"
          valor={`R$ ${resumo.receitaGerada.toFixed(2).replace('.', ',')}`}
          icone={<DollarSign className="w-5 h-5" />}
          cor="emerald"
          className="col-span-2 md:col-span-1"
        />
      </div>

      <TabelaReservasHoje reservas={reservasHoje} />
    </div>
  )
}
