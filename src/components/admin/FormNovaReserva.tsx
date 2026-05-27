'use client'

import { useRef, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { criarReserva } from '@/lib/actions/reservas'
import { toast } from 'sonner'
import { dataHojeBR } from '@/lib/tz'

const VALORES_PADRAO = ['59.90', '69.90', '79.90', '99.90']

export function FormNovaReserva() {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [adultos, setAdultos] = useState(2)
  const [criancas50, setCriancas50] = useState(0)
  const [criancasIsento, setCriancasIsento] = useState(0)
  const [criancasIntegral, setCriancasIntegral] = useState(0)
  const [valorPorPessoa, setValorPorPessoa] = useState('59.90')
  const [canal, setCanal] = useState('reserva')

  const VALOR_MEIA = 39.95
  const total = (adultos + criancasIntegral) * Number(valorPorPessoa) + criancas50 * VALOR_MEIA

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    data.set('canalOrigem', canal)
    startTransition(async () => {
      const result = await criarReserva(data)
      if (result?.error) {
        const erros = Object.values(result.error).flat()
        toast.error(erros[0] ?? 'Erro ao criar reserva')
        return
      }
      toast.success('Reserva criada com sucesso!')
      router.push('/admin/reservas')
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="nomeCliente">Nome do cliente *</Label>
          <Input id="nomeCliente" name="nomeCliente" placeholder="Nome completo" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" placeholder="(51) 99999-9999" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="canalOrigem">Canal</Label>
          <Select value={canal} onValueChange={(v) => v && setCanal(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reserva">Reserva (WhatsApp)</SelectItem>
              <SelectItem value="site">Site</SelectItem>
              <SelectItem value="porta">Porta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            name="data"
            type="date"
            defaultValue={dataHojeBR()}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="horarioReservado">Horário *</Label>
          <Input id="horarioReservado" name="horarioReservado" type="time" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adultos">Adultos *</Label>
          <Input
            id="adultos"
            name="adultos"
            type="number"
            min={1}
            value={adultos}
            onChange={(e) => setAdultos(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valorPorPessoa">Valor por pessoa (R$) *</Label>
          <div className="flex gap-2">
            <Input
              id="valorPorPessoa"
              name="valorPorPessoa"
              type="number"
              step="0.01"
              min={0}
              value={valorPorPessoa}
              onChange={(e) => setValorPorPessoa(e.target.value)}
              required
              className="flex-1"
            />
          </div>
          <div className="flex gap-1 flex-wrap mt-1">
            {VALORES_PADRAO.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValorPorPessoa(v)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  valorPorPessoa === v
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                }`}
              >
                R$ {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="criancas50pct">Meia R$39,95 (6-9 anos)</Label>
          <Input
            id="criancas50pct"
            name="criancas50pct"
            type="number"
            min={0}
            value={criancas50}
            onChange={(e) => setCriancas50(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="criancasIsento">Cortesia (até 5 anos)</Label>
          <Input
            id="criancasIsento"
            name="criancasIsento"
            type="number"
            min={0}
            value={criancasIsento}
            onChange={(e) => setCriancasIsento(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="criancasIntegral">Integral (10+ anos)</Label>
          <Input
            id="criancasIntegral"
            name="criancasIntegral"
            type="number"
            min={0}
            value={criancasIntegral}
            onChange={(e) => setCriancasIntegral(Number(e.target.value))}
          />
        </div>

        <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-emerald-800">Total calculado</span>
          <span className="text-xl font-bold text-emerald-700">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" name="observacoes" placeholder="Via site, grupo especial, etc." rows={2} />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          {pending ? 'Salvando...' : 'Criar Reserva'}
        </Button>
      </div>
    </form>
  )
}
