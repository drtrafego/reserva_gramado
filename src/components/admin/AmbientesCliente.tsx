'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  criarAmbiente,
  atualizarAmbiente,
  toggleAmbienteAtivo,
  adicionarTipoMesa,
  removerTipoMesa,
} from '@/lib/actions/ambientes'
import { toast } from 'sonner'
import { Plus, Pencil, LayoutGrid, Users, CheckCircle, XCircle, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { Ambiente, TipoMesa } from '@/lib/db/schema'

type AmbienteComMesas = Ambiente & { tiposMesa: TipoMesa[] }

interface Props {
  ambientes: AmbienteComMesas[]
}

function FormAmbiente({
  inicial,
  onSalvar,
  onFechar,
  pending,
}: {
  inicial?: Ambiente
  onSalvar: (fd: FormData) => void
  onFechar: () => void
  pending: boolean
}) {
  const [permiteJuntar, setPermiteJuntar] = useState(inicial?.permiteJuntarMesas ?? false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('permiteJuntarMesas', permiteJuntar ? 'true' : 'false')
    onSalvar(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {inicial && <input type="hidden" name="id" value={inicial.id} />}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome do ambiente</Label>
        <Input id="nome" name="nome" defaultValue={inicial?.nome} placeholder="Ex: Salão Central" required />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="permiteJuntarMesas"
            checked={permiteJuntar}
            onChange={(e) => setPermiteJuntar(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-600"
          />
          <Label htmlFor="permiteJuntarMesas" className="cursor-pointer">Permite juntar mesas (120 min)</Label>
        </div>
        {permiteJuntar && (
          <div className="space-y-2">
            <Label htmlFor="juntarApartirDe">Juntar a partir de (pessoas)</Label>
            <Input id="juntarApartirDe" name="juntarApartirDe" type="number" min={2} defaultValue={inicial?.juntarApartirDe ?? ''} placeholder="Ex: 8" />
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onFechar} disabled={pending}>Cancelar</Button>
        <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700">
          {pending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function PainelMesas({
  ambiente,
  onAdicionarMesa,
  onRemoverMesa,
  pending,
}: {
  ambiente: AmbienteComMesas
  onAdicionarMesa: (ambienteId: string, capacidade: number, quantidade: number) => void
  onRemoverMesa: (id: string) => void
  pending: boolean
}) {
  const [capacidade, setCapacidade] = useState(4)
  const [quantidade, setQuantidade] = useState(1)

  const totalAssentos = ambiente.tiposMesa.reduce((s, m) => s + m.capacidade * m.quantidade, 0)

  return (
    <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Mesas</p>
        <span className="text-xs text-gray-400">{totalAssentos} assentos total</span>
      </div>

      {ambiente.tiposMesa.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Nenhuma mesa cadastrada</p>
      ) : (
        <div className="space-y-1.5">
          {ambiente.tiposMesa.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{m.quantidade}x</span> mesa de{' '}
                <span className="font-semibold">{m.capacidade}</span> lugares
                <span className="text-gray-400 ml-1">= {m.capacidade * m.quantidade} assentos</span>
              </span>
              <button
                onClick={() => onRemoverMesa(m.id)}
                disabled={pending}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 pt-1">
        <div className="space-y-1 flex-1">
          <Label className="text-xs">Qtd</Label>
          <Input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-xs">Lugares/mesa</Label>
          <Input
            type="number"
            min={1}
            value={capacidade}
            onChange={(e) => setCapacidade(Number(e.target.value))}
            className="h-8 text-sm"
          />
        </div>
        <Button
          size="sm"
          className="h-8 bg-emerald-600 hover:bg-emerald-700 px-3"
          onClick={() => onAdicionarMesa(ambiente.id, capacidade, quantidade)}
          disabled={pending}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  )
}

export function AmbientesCliente({ ambientes }: Props) {
  const [pending, startTransition] = useTransition()
  const [modalNovo, setModalNovo] = useState(false)
  const [editando, setEditando] = useState<Ambiente | null>(null)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandidos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCriar(fd: FormData) {
    startTransition(async () => {
      const res = await criarAmbiente(fd)
      if (res?.error) { toast.error('Erro ao criar ambiente'); return }
      toast.success('Ambiente criado!')
      setModalNovo(false)
    })
  }

  function handleAtualizar(fd: FormData) {
    startTransition(async () => {
      const res = await atualizarAmbiente(fd)
      if (res?.error) { toast.error('Erro ao atualizar'); return }
      toast.success('Ambiente atualizado!')
      setEditando(null)
    })
  }

  function handleToggle(id: string, ativo: boolean) {
    startTransition(async () => {
      await toggleAmbienteAtivo(id, !ativo)
      toast.success(ativo ? 'Ambiente desativado' : 'Ambiente ativado')
    })
  }

  function handleAdicionarMesa(ambienteId: string, capacidade: number, quantidade: number) {
    startTransition(async () => {
      const res = await adicionarTipoMesa(ambienteId, capacidade, quantidade)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Mesa adicionada!')
    })
  }

  function handleRemoverMesa(id: string) {
    startTransition(async () => {
      await removerTipoMesa(id)
      toast.success('Mesa removida')
    })
  }

  const ativos = ambientes.filter((a) => a.ativo)
  const totalAssentos = ativos.reduce(
    (s, a) => s + a.tiposMesa.reduce((ms, m) => ms + m.capacidade * m.quantidade, 0),
    0
  )
  const totalMesas = ativos.reduce(
    (s, a) => s + a.tiposMesa.reduce((ms, m) => ms + m.quantidade, 0),
    0
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambientes</h1>
          <p className="text-sm text-gray-500">Gerencie os espaços e mesas do restaurante</p>
        </div>
        <Button onClick={() => setModalNovo(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Plus className="w-4 h-4" />
          Novo Ambiente
        </Button>
      </div>

      {ativos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Total de mesas</p>
              <p className="text-2xl font-bold text-gray-900">{totalMesas}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Capacidade simultânea</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssentos} pessoas</p>
            </div>
          </div>
        </div>
      )}

      {ambientes.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum ambiente cadastrado</p>
          <p className="text-sm mt-1">Clique em &quot;Novo Ambiente&quot; para começar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {ambientes.map((a) => {
            const expanded = expandidos.has(a.id)
            const assentos = a.tiposMesa.reduce((s, m) => s + m.capacidade * m.quantidade, 0)
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${!a.ativo ? 'opacity-50' : ''}`}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <button
                    onClick={() => toggleExpand(a.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.nome}</p>
                      <p className="text-xs text-gray-400">
                        {a.tiposMesa.length > 0
                          ? `${a.tiposMesa.reduce((s, m) => s + m.quantidade, 0)} mesas · ${assentos} assentos`
                          : 'Sem mesas cadastradas'}
                        {a.permiteJuntarMesas && ` · Junta mesas`}
                      </p>
                    </div>
                    {expanded
                      ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditando(a)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-8 w-8 p-0 ${a.ativo ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      onClick={() => handleToggle(a.id, a.ativo ?? true)}
                      disabled={pending}
                    >
                      {a.ativo ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-4">
                    <PainelMesas
                      ambiente={a}
                      onAdicionarMesa={handleAdicionarMesa}
                      onRemoverMesa={handleRemoverMesa}
                      pending={pending}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={modalNovo} onOpenChange={setModalNovo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Ambiente</DialogTitle></DialogHeader>
          <FormAmbiente onSalvar={handleCriar} onFechar={() => setModalNovo(false)} pending={pending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Ambiente</DialogTitle></DialogHeader>
          {editando && (
            <FormAmbiente inicial={editando} onSalvar={handleAtualizar} onFechar={() => setEditando(null)} pending={pending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
