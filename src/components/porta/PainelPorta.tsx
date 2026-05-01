'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { CardReserva } from './CardReserva'
import { ModalConfirmarChegada } from './ModalConfirmarChegada'
import { ModalEntradaPorta } from './ModalEntradaPorta'
import { IndicadorCapacidade } from './IndicadorCapacidade'
import type { Reserva, StatusReserva } from '@/lib/db/schema'

type FiltroStatus = 'todos' | StatusReserva

interface Props {
  reservas: Reserva[]
  capacidadeOcupada: number
  capacidadeEfetiva: number
  alertaPct: number
  dataFormatada: string
}

const FILTROS: { valor: FiltroStatus; label: string; icone: React.ElementType; cor: string }[] = [
  { valor: 'todos', label: 'Todos', icone: Users, cor: 'bg-gray-100 text-gray-700 border-gray-200' },
  { valor: 'pendente', label: 'Aguardando', icone: Clock, cor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { valor: 'compareceu', label: 'Chegou', icone: CheckCircle, cor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { valor: 'nao_compareceu', label: 'Não veio', icone: XCircle, cor: 'bg-red-50 text-red-600 border-red-200' },
]

export function PainelPorta({
  reservas,
  capacidadeOcupada,
  capacidadeEfetiva,
  alertaPct,
  dataFormatada,
}: Props) {
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [reservaConfirmando, setReservaConfirmando] = useState<Reserva | null>(null)
  const [modalPortaAberto, setModalPortaAberto] = useState(false)

  const reservasFiltradas = filtro === 'todos' ? reservas : reservas.filter((r) => r.status === filtro)

  const totais = {
    todos: reservas.length,
    pendente: reservas.filter((r) => r.status === 'pendente').length,
    compareceu: reservas.filter((r) => r.status === 'compareceu').length,
    nao_compareceu: reservas.filter((r) => r.status === 'nao_compareceu').length,
  }

  const pessoasConfirmadas = reservas
    .filter((r) => r.status === 'compareceu')
    .reduce((s, r) => s + (r.pessoasChegada ?? r.adultos + r.criancas50pct + r.criancasIsento), 0)

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-tight">Reservas do Dia</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dataFormatada}</p>
        </div>
        <Button
          onClick={() => setModalPortaAberto(true)}
          className="bg-orange-500 hover:bg-orange-600 h-14 px-5 text-base font-bold rounded-2xl shadow-lg shadow-orange-200 gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Entrada
        </Button>
      </div>

      {/* Capacidade */}
      <IndicadorCapacidade
        ocupadas={capacidadeOcupada}
        capacidade={capacidadeEfetiva}
        alerta={alertaPct}
      />

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{totais.pendente}</p>
          <p className="text-xs text-amber-500 font-medium mt-0.5">Aguardando</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{totais.compareceu}</p>
          <p className="text-xs text-emerald-500 font-medium mt-0.5">Confirmados</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-red-500">{totais.nao_compareceu}</p>
          <p className="text-xs text-red-400 font-medium mt-0.5">Não vieram</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {FILTROS.map((f) => {
          const ativo = filtro === f.valor
          const qtd = totais[f.valor]
          return (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                ativo ? f.cor + ' shadow-sm' : 'bg-white text-gray-400 border-gray-100'
              }`}
            >
              <f.icone className="w-3.5 h-3.5" />
              {f.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${ativo ? 'bg-white/60' : 'bg-gray-100'}`}>
                {qtd}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista de reservas */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pb-4">
        {reservasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <Users className="w-12 h-12 mb-3" />
            <p className="font-semibold text-gray-400">Nenhuma reserva</p>
            <p className="text-sm text-gray-300 mt-0.5">
              {filtro === 'todos' ? 'Nenhuma reserva para hoje' : `Nenhuma com este status`}
            </p>
          </div>
        ) : (
          reservasFiltradas.map((r) => (
            <CardReserva key={r.id} reserva={r} onConfirmar={setReservaConfirmando} />
          ))
        )}
      </div>

      <ModalConfirmarChegada
        reserva={reservaConfirmando}
        open={!!reservaConfirmando}
        onClose={() => setReservaConfirmando(null)}
      />
      <ModalEntradaPorta open={modalPortaAberto} onClose={() => setModalPortaAberto(false)} />
    </div>
  )
}
