'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { CardResumo } from './CardResumo'
import { CheckCircle, XCircle, Users, DollarSign, TrendingDown, Calendar } from 'lucide-react'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CORES_CANAL = ['#059669', '#f97316', '#7c3aed']
const ANOS = [2024, 2025, 2026]

interface Props {
  relatorio: Awaited<ReturnType<typeof import('@/lib/db/queries').getRelatorioMensal>>
  mes: number
  ano: number
}

function fmt(v: number) {
  return `R$ ${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace('.', ',').replace(',', '.').replace(/\.(\d{2})$/, ',$1')}`
}

export function RelatorioMensal({ relatorio, mes, ano }: Props) {
  const router = useRouter()

  function navegar(novoMes: number, novoAno: number) {
    router.push(`/admin/relatorios?mes=${novoMes}&ano=${novoAno}`)
  }

  const dadosCanal = [
    { name: 'WhatsApp', value: relatorio.porCanal.reserva, receita: relatorio.receitaPorCanal.reserva },
    { name: 'Porta', value: relatorio.porCanal.porta, receita: relatorio.receitaPorCanal.porta },
    { name: 'Site', value: relatorio.porCanal.site, receita: relatorio.receitaPorCanal.site },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório Mensal</h1>
          <p className="text-sm text-gray-500">{MESES[mes - 1]} de {ano}</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={mes}
            onChange={(e) => navegar(Number(e.target.value), ano)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => navegar(mes, Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <CardResumo titulo="Total de reservas" valor={relatorio.totalReservas} icone={<Calendar className="w-5 h-5" />} cor="blue" />
        <CardResumo titulo="Compareceram" valor={relatorio.compareceram} icone={<CheckCircle className="w-5 h-5" />} cor="green" />
        <CardResumo titulo="Não vieram" valor={relatorio.naoCompareceram} icone={<XCircle className="w-5 h-5" />} cor="red" />
        <CardResumo titulo="Pendentes" valor={relatorio.pendentes} icone={<Users className="w-5 h-5" />} cor="yellow" />
        <CardResumo titulo="Receita gerada" valor={fmt(relatorio.receitaTotal)} icone={<DollarSign className="w-5 h-5" />} cor="emerald" className="col-span-2 md:col-span-1" />
        <CardResumo titulo="Valor perdido" valor={fmt(relatorio.receitaPerdida)} icone={<TrendingDown className="w-5 h-5" />} cor="red" className="col-span-2 md:col-span-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {relatorio.graficosDia.length > 0 && (
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Reservas por dia</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={relatorio.graficosDia} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [value, name === 'compareceu' ? 'Compareceu' : 'Não veio']}
                />
                <Bar dataKey="compareceu" fill="#059669" radius={[3, 3, 0, 0]} name="compareceu" />
                <Bar dataKey="nao_compareceu" fill="#fca5a5" radius={[3, 3, 0, 0]} name="nao_compareceu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {dadosCanal.length > 0 && (
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Distribuição por canal</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosCanal}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dadosCanal.map((_, i) => (
                    <Cell key={i} fill={CORES_CANAL[i % CORES_CANAL.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, 'Reservas']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {dadosCanal.map((d, i) => (
                <div key={d.name} className="text-center">
                  <div className="text-xs text-gray-500">{d.name}</div>
                  <div className="font-bold text-gray-900">{d.value}</div>
                  <div className="text-xs text-gray-400">{fmt(d.receita)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {relatorio.horariosPico.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Horários de pico</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={relatorio.horariosPico} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="hora" type="category" tick={{ fontSize: 11 }} width={45} />
              <Tooltip formatter={(v) => [v, 'Reservas']} />
              <Bar dataKey="qtd" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {relatorio.totalReservas === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma reserva em {MESES[mes - 1]} de {ano}</p>
        </div>
      )}
    </div>
  )
}
