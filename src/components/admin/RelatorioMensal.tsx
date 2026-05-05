'use client'

import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import { CardResumo } from './CardResumo'
import {
  CheckCircle, XCircle, Users, Calendar,
  TrendingUp, TrendingDown, Target, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Reserva } from '@/lib/db/schema'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CORES_CANAL = ['#059669', '#f97316', '#7c3aed']
const ANOS = [2024, 2025, 2026]

type Relatorio = Awaited<ReturnType<typeof import('@/lib/db/queries').getRelatorioMensal>>

interface Props {
  relatorio: Relatorio
  mes: number
  ano: number
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtK(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return `R$ ${v.toFixed(0)}`
}

function exportarCSV(rows: Reserva[], mes: number, ano: number) {
  const cabecalho = ['Data', 'Nome', 'Telefone', 'Horário Reservado', 'Horário Chegada', 'Adultos', 'Crianças 50%', 'Crianças Isento', 'Pessoas na Chegada', 'Valor por Pessoa', 'Valor Total', 'Canal', 'Status', 'Observações']
  const linhas = rows.map((r) =>
    [
      r.data, r.nomeCliente ?? '', r.telefone ?? '',
      r.horarioReservado ?? '', r.horarioChegada ?? '',
      r.adultos, r.criancas50pct, r.criancasIsento,
      r.pessoasChegada ?? '',
      r.valorPorPessoa ?? '', r.valorTotal ?? '',
      r.canalOrigem, r.status, r.observacoes ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')
  )
  const csv = [cabecalho.join(';'), ...linhas].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reservas-${ano}-${String(mes).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function RelatorioMensal({ relatorio, mes, ano }: Props) {
  const router = useRouter()

  function navegar(novoMes: number, novoAno: number) {
    router.push(`/admin/relatorios?mes=${novoMes}&ano=${novoAno}`)
  }

  const taxaPresenca =
    relatorio.compareceram + relatorio.naoCompareceram > 0
      ? Math.round((relatorio.compareceram / (relatorio.compareceram + relatorio.naoCompareceram)) * 100)
      : 0

  const dadosCanal = [
    { name: 'Reserva', value: relatorio.porCanal.reserva, receita: relatorio.receitaPorCanal.reserva },
    { name: 'Porta', value: relatorio.porCanal.porta, receita: relatorio.receitaPorCanal.porta },
    { name: 'Site', value: relatorio.porCanal.site, receita: relatorio.receitaPorCanal.site },
    { name: 'WhatsApp', value: relatorio.porCanal.whatsapp, receita: relatorio.receitaPorCanal.whatsapp },
  ].filter((d) => d.value > 0)

  const dadosReceita = relatorio.graficosDia.reduce<Array<{ data: string; receita: number; acumulado: number }>>(
    (acc, d) => {
      const prev = acc[acc.length - 1]?.acumulado ?? 0
      return [...acc, { data: d.data, receita: d.receita, acumulado: prev + d.receita }]
    },
    []
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório Mensal</h1>
          <p className="text-sm text-gray-500">{MESES[mes - 1]} de {ano}</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {relatorio.rows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              onClick={() => exportarCSV(relatorio.rows, mes, ano)}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          )}
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

      {relatorio.totalReservas === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma reserva em {MESES[mes - 1]} de {ano}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CardResumo
              variante="hero"
              titulo="Receita gerada"
              valor={fmt(relatorio.receitaTotal)}
              icone={<TrendingUp className="w-5 h-5" />}
              subtitulo={`${relatorio.compareceram} reservas confirmadas`}
            />
            <CardResumo
              variante="danger"
              titulo="Valor perdido"
              valor={fmt(relatorio.receitaPerdida)}
              icone={<TrendingDown className="w-5 h-5" />}
              subtitulo={`${relatorio.naoCompareceram} no-shows no mês`}
            />
            <CardResumo
              variante="default"
              titulo="Taxa de presença"
              valor={`${taxaPresenca}%`}
              icone={<Target className="w-5 h-5" />}
              cor="emerald"
              subtitulo={`${relatorio.totalReservas} reservas no total`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CardResumo
              titulo="Total de reservas"
              valor={relatorio.totalReservas}
              icone={<Calendar className="w-5 h-5" />}
              cor="blue"
            />
            <CardResumo
              titulo="Compareceram"
              valor={relatorio.compareceram}
              icone={<CheckCircle className="w-5 h-5" />}
              cor="green"
            />
            <CardResumo
              titulo="Não vieram"
              valor={relatorio.naoCompareceram}
              icone={<XCircle className="w-5 h-5" />}
              cor="red"
            />
            <CardResumo
              titulo="Pendentes"
              valor={relatorio.pendentes}
              icone={<Users className="w-5 h-5" />}
              cor="yellow"
            />
          </div>

          {dadosReceita.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Receita por dia</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Evolução da receita ao longo do mês</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    Receita diária
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-emerald-300 inline-block" />
                    Acumulado
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dadosReceita} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="gradAcumulado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtK} tick={{ fontSize: 10 }} width={56} />
                  <Tooltip
                    formatter={(value, name) => [
                      fmt(Number(value ?? 0)),
                      name === 'receita' ? 'Receita do dia' : 'Acumulado',
                    ]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="acumulado"
                    stroke="#34d399"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    fill="url(#gradAcumulado)"
                    dot={false}
                    name="acumulado"
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#gradReceita)"
                    dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    name="receita"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {relatorio.graficosDia.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">Reservas por dia</h3>
                <p className="text-xs text-gray-400 mb-4">Comparecimento vs no-show</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={relatorio.graficosDia} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [value, name === 'compareceu' ? 'Compareceu' : 'Não veio']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="compareceu" fill="#059669" radius={[3, 3, 0, 0]} name="compareceu" />
                    <Bar dataKey="nao_compareceu" fill="#fca5a5" radius={[3, 3, 0, 0]} name="nao_compareceu" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {dadosCanal.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">Distribuição por canal</h3>
                <p className="text-xs text-gray-400 mb-4">Origem das reservas</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dadosCanal}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dadosCanal.map((_, i) => (
                        <Cell key={i} fill={CORES_CANAL[i % CORES_CANAL.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, _name, props) => [
                        `${Number(v ?? 0)} reservas • ${fmt(Number(props.payload?.receita ?? 0))}`,
                        'Canal',
                      ]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {dadosCanal.map((d, i) => (
                    <div key={d.name} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: CORES_CANAL[i] }} />
                        <span className="text-xs text-gray-500">{d.name}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">{d.value}</div>
                      <div className="text-xs text-gray-400">{fmt(d.receita)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {relatorio.horariosPico.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Horários de pico geral</h3>
              <p className="text-xs text-gray-400 mb-4">Top 8 horários mais movimentados no mês (todos os canais)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={relatorio.horariosPico} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="hora" type="category" tick={{ fontSize: 11 }} width={45} />
                  <Tooltip
                    formatter={(v) => [v, 'Atendimentos']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="qtd" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                { canal: 'reserva' as const, label: 'WhatsApp / Reserva', cor: '#059669' },
                { canal: 'porta' as const, label: 'Porta (Walk-in)', cor: '#f97316' },
                { canal: 'site' as const, label: 'Site', cor: '#7c3aed' },
              ] as const
            ).map(({ canal, label, cor }) => {
              const dados = relatorio.horariosPicoPorCanal[canal]
              if (dados.length === 0) return null
              return (
                <div key={canal} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-0.5">{label}</h3>
                  <p className="text-xs text-gray-400 mb-4">Horários de pico</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={dados} layout="vertical" barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="hora" type="category" tick={{ fontSize: 10 }} width={42} />
                      <Tooltip
                        formatter={(v) => [v, 'Atendimentos']}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Bar dataKey="qtd" fill={cor} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
