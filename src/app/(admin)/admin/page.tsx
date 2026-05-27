import { ptBR } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { TZ_BRASIL, dataHojeBR } from '@/lib/tz'
import { getResumoDoDia, getReservasDoDia } from '@/lib/db/queries'
import { TabelaReservasHoje } from '@/components/admin/TabelaReservasHoje'
import { TrendingUp, TrendingDown, AlertCircle, Users, CheckCircle, XCircle, Clock, MessageCircle, DoorOpen, Globe } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminPage() {
  const hoje = dataHojeBR()
  const dataExibida = formatInTimeZone(new Date(), TZ_BRASIL, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const [resumo, reservasHoje] = await Promise.all([
    getResumoDoDia(hoje),
    getReservasDoDia(hoje),
  ])

  const taxaPresenca =
    resumo.compareceu + resumo.naoCompareceu > 0
      ? Math.round((resumo.compareceu / (resumo.compareceu + resumo.naoCompareceu)) * 100)
      : null

  const porCanal = {
    reserva: reservasHoje.filter((r) => r.canalOrigem === 'reserva'),
    porta: reservasHoje.filter((r) => r.canalOrigem === 'porta'),
    site: reservasHoje.filter((r) => r.canalOrigem === 'site'),
  }

  const receitaCanal = {
    reserva: porCanal.reserva.filter((r) => r.status === 'compareceu').reduce((s, r) => s + Number(r.valorTotal ?? 0), 0),
    porta: porCanal.porta.filter((r) => r.status === 'compareceu').reduce((s, r) => s + Number(r.valorTotal ?? 0), 0),
    site: porCanal.site.filter((r) => r.status === 'compareceu').reduce((s, r) => s + Number(r.valorTotal ?? 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 capitalize">{dataExibida}</p>
        </div>
        <Link
          href="/porta"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-orange-200"
        >
          <DoorOpen className="w-4 h-4" />
          Painel da Porta
        </Link>
      </div>

      {/* Trio financeiro principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 shadow-xl shadow-emerald-200/60 col-span-1">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Receita hoje</p>
          <p className="text-4xl font-black text-white mt-1 leading-none">{fmtBRL(resumo.receitaGerada)}</p>
          <p className="text-emerald-200 text-sm mt-2">{resumo.compareceu} confirmado(s)</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-3xl p-6 shadow-xl shadow-red-200/60">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <p className="text-red-100 text-xs font-bold uppercase tracking-widest">Valor perdido</p>
          <p className="text-4xl font-black text-white mt-1 leading-none">{fmtBRL(resumo.receitaPerdida)}</p>
          <p className="text-red-200 text-sm mt-2">{resumo.naoCompareceu} no-show(s)</p>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-6 shadow-xl shadow-amber-200/60">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-amber-100 text-xs font-bold uppercase tracking-widest">Em risco</p>
          <p className="text-4xl font-black text-white mt-1 leading-none">{fmtBRL(resumo.receitaPotencial)}</p>
          <p className="text-amber-100 text-sm mt-2">{resumo.pendente} aguardando</p>
        </div>
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total de reservas', valor: resumo.total, sub: `${resumo.pessoasEsperadas} pessoas`, icone: Users, cor: 'blue' },
          { label: 'Confirmados', valor: resumo.compareceu, sub: taxaPresenca !== null ? `${taxaPresenca}% de presença` : 'Sem dados', icone: CheckCircle, cor: 'green' },
          { label: 'Não vieram', valor: resumo.naoCompareceu, sub: 'No-show', icone: XCircle, cor: 'red' },
          { label: 'Aguardando', valor: resumo.pendente, sub: 'Pendentes', icone: Clock, cor: 'yellow' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              item.cor === 'blue' ? 'bg-blue-50' :
              item.cor === 'green' ? 'bg-emerald-50' :
              item.cor === 'red' ? 'bg-red-50' : 'bg-amber-50'
            }`}>
              <item.icone className={`w-4.5 h-4.5 ${
                item.cor === 'blue' ? 'text-blue-600' :
                item.cor === 'green' ? 'text-emerald-600' :
                item.cor === 'red' ? 'text-red-500' : 'text-amber-500'
              }`} />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{item.valor}</p>
            <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Canal breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Origem das reservas hoje</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { canal: 'reserva', label: 'WhatsApp', icone: MessageCircle, cor: 'emerald', qtd: porCanal.reserva.length, receita: receitaCanal.reserva, bg: 'bg-emerald-50 border-emerald-100', texto: 'text-emerald-700', icone_cor: 'text-emerald-600 bg-emerald-100' },
            { canal: 'porta', label: 'Porta', icone: DoorOpen, cor: 'orange', qtd: porCanal.porta.length, receita: receitaCanal.porta, bg: 'bg-orange-50 border-orange-100', texto: 'text-orange-700', icone_cor: 'text-orange-600 bg-orange-100' },
            { canal: 'site', label: 'Site', icone: Globe, cor: 'violet', qtd: porCanal.site.length, receita: receitaCanal.site, bg: 'bg-violet-50 border-violet-100', texto: 'text-violet-700', icone_cor: 'text-violet-600 bg-violet-100' },
          ].map((c) => (
            <div key={c.canal} className={`border rounded-2xl p-4 ${c.bg}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.icone_cor}`}>
                <c.icone className="w-4.5 h-4.5" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-wide ${c.texto} opacity-70`}>{c.label}</p>
              <p className={`text-3xl font-black ${c.texto} mt-0.5`}>{c.qtd}</p>
              <p className={`text-xs font-semibold ${c.texto} mt-1 opacity-80`}>{fmtBRL(c.receita)}</p>
            </div>
          ))}
        </div>
      </div>

      <TabelaReservasHoje reservas={reservasHoje} />
    </div>
  )
}
