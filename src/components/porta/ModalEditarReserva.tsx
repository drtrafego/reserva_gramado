'use client'

import { useRef, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { editarReserva } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva | null
  open: boolean
  onClose: () => void
}

export function ModalEditarReserva({ reserva, open, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  if (!reserva) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    startTransition(async () => {
      const result = await editarReserva(new FormData(form!))
      if (result?.error) {
        toast.error('Erro ao salvar alterações')
        return
      }
      toast.success('Reserva atualizada!')
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Reserva</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={reserva.id} />

          <div className="space-y-2">
            <Label htmlFor="edit-nome">Nome do cliente</Label>
            <Input
              id="edit-nome"
              name="nomeCliente"
              defaultValue={reserva.nomeCliente ?? ''}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-tel">Telefone</Label>
              <Input
                id="edit-tel"
                name="telefone"
                defaultValue={reserva.telefone ?? ''}
                placeholder="(51) 99999-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-horario">Horário reservado</Label>
              <Input
                id="edit-horario"
                name="horarioReservado"
                type="time"
                defaultValue={reserva.horarioReservado ?? ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-adultos">Adultos</Label>
              <Input
                id="edit-adultos"
                name="adultos"
                type="number"
                min={1}
                defaultValue={reserva.adultos}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-c50">Meia R$39,95 (6-9 anos)</Label>
              <Input
                id="edit-c50"
                name="criancas50pct"
                type="number"
                min={0}
                defaultValue={reserva.criancas50pct}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cis">Cortesia (até 5 anos)</Label>
              <Input
                id="edit-cis"
                name="criancasIsento"
                type="number"
                min={0}
                defaultValue={reserva.criancasIsento}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-valor">Valor por pessoa (R$)</Label>
            <Input
              id="edit-valor"
              name="valorPorPessoa"
              type="number"
              min={0}
              step="0.01"
              defaultValue={reserva.valorPorPessoa ?? ''}
              placeholder="89.90"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-obs">Observações</Label>
            <Textarea
              id="edit-obs"
              name="observacoes"
              rows={2}
              defaultValue={reserva.observacoes ?? ''}
              placeholder="Alguma observação?"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
              {pending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
