'use client'

import { useRef, useTransition, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { registrarEntradaPorta } from '@/lib/actions/reservas'
import { toast } from 'sonner'

const VALORES_PADRAO = ['49.90', '69.90', '79.90', '89.90']

interface Props {
  open: boolean
  onClose: () => void
}

export function ModalEntradaPorta({ open, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [adultos, setAdultos] = useState(2)
  const [criancas50, setCriancas50] = useState(0)
  const [criancasIsento, setCriancasIsento] = useState(0)
  const [valorPorPessoa, setValorPorPessoa] = useState('69.90')

  const total = adultos * Number(valorPorPessoa) + criancas50 * (Number(valorPorPessoa) * 0.5)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    startTransition(async () => {
      const result = await registrarEntradaPorta(data)
      if (result?.error) {
        toast.error('Verifique os dados e tente novamente')
        return
      }
      toast.success('Entrada registrada!')
      form.reset()
      setAdultos(2)
      setCriancas50(0)
      setCriancasIsento(0)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Entrada sem Reserva</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do cliente (opcional)</Label>
            <Input name="nomeCliente" placeholder="Nome" className="h-12 text-base" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Adultos *</Label>
              <Input
                name="adultos"
                type="number"
                min={1}
                value={adultos}
                onChange={(e) => setAdultos(Number(e.target.value))}
                className="h-12 text-base"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cri. 50%</Label>
              <Input
                name="criancas50pct"
                type="number"
                min={0}
                value={criancas50}
                onChange={(e) => setCriancas50(Number(e.target.value))}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cri. Grátis</Label>
              <Input
                name="criancasIsento"
                type="number"
                min={0}
                value={criancasIsento}
                onChange={(e) => setCriancasIsento(Number(e.target.value))}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Valor por pessoa (R$)</Label>
            <Input
              name="valorPorPessoa"
              type="number"
              step="0.01"
              min={0}
              value={valorPorPessoa}
              onChange={(e) => setValorPorPessoa(e.target.value)}
              className="h-12 text-base"
            />
            <div className="flex gap-2 flex-wrap">
              {VALORES_PADRAO.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValorPorPessoa(v)}
                  className={`text-sm px-3 py-1 rounded-lg border font-medium transition-colors ${
                    valorPorPessoa === v
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-200 text-gray-600 hover:border-orange-400'
                  }`}
                >
                  R$ {v}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-orange-800">Total</span>
            <span className="text-xl font-bold text-orange-700">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea name="observacoes" placeholder="Alguma observação?" rows={2} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending} className="flex-1 h-12">
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-base">
              {pending ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
