'use client'

import { useRef, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { confirmarChegada } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva | null
  open: boolean
  onClose: () => void
}

export function ModalConfirmarChegada({ reserva, open, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const totalReservado = reserva ? reserva.adultos + reserva.criancas50pct + reserva.criancasIsento : 1
  const [pessoas, setPessoas] = useState(totalReservado.toString())

  if (!reserva) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    startTransition(async () => {
      const result = await confirmarChegada(data)
      if (result?.error) {
        toast.error('Erro ao confirmar chegada')
        return
      }
      toast.success(`${reserva?.nomeCliente ?? 'Cliente'} confirmado!`)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirmar Chegada</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={reserva.id} />

          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-800">{reserva.nomeCliente ?? 'Sem nome'}</p>
            {reserva.horarioReservado && (
              <p className="text-gray-500">Reserva: {reserva.horarioReservado}</p>
            )}
            <p className="text-gray-500">Reservado para: {totalReservado} pessoas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pessoasChegada">Pessoas que chegaram</Label>
            <Input
              id="pessoasChegada"
              name="pessoasChegada"
              type="number"
              min={1}
              value={pessoas}
              onChange={(e) => setPessoas(e.target.value)}
              className="text-lg h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              placeholder="Alguma observação?"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-700">
              {pending ? 'Confirmando...' : 'Confirmar Chegada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
