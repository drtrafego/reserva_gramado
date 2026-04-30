'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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

  const reservasFiltradas =
    filtro === 'todos' ? reservas : reservas.filter((r) => r.status === filtro)

  const totais = {
    todos: reservas.length,
    pendente: reservas.filter((r) => r.status === 'pendente').length,
    compareceu: reservas.filter((r) => r.status === 'compareceu').length,
    nao_compareceu: reservas.filter((r) => r.status === 'nao_compareceu').length,
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas do Dia</h1>
          <p className="text-sm text-gray-500">{dataFormatada}</p>
        </div>
        <Button
          onClick={() => setModalPortaAberto(true)}
          className="bg-orange-500 hover:bg-orange-600 h-12 px-4 text-base"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Entrada
        </Button>
      </div>

      <IndicadorCapacidade
        ocupadas={capacidadeOcupada}
        capacidade={capacidadeEfetiva}
        alerta={alertaPct}
      />

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as FiltroStatus)}>
        <TabsList className="w-full h-11 grid grid-cols-4">
          <TabsTrigger value="todos" className="text-sm">
            Todos ({totais.todos})
          </TabsTrigger>
          <TabsTrigger value="pendente" className="text-sm">
            Aguardando ({totais.pendente})
          </TabsTrigger>
          <TabsTrigger value="compareceu" className="text-sm">
            Chegou ({totais.compareceu})
          </TabsTrigger>
          <TabsTrigger value="nao_compareceu" className="text-sm">
            Não veio ({totais.nao_compareceu})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {reservasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-lg font-medium">Nenhuma reserva</p>
            <p className="text-sm">
              {filtro === 'todos' ? 'Nenhuma reserva para hoje' : `Nenhuma com status "${filtro}"`}
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

      <ModalEntradaPorta
        open={modalPortaAberto}
        onClose={() => setModalPortaAberto(false)}
      />
    </div>
  )
}
