'use client'

import { useRef, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { atualizarConfig } from '@/lib/actions/config'
import { toast } from 'sonner'
import { Settings, Users, Clock, AlertTriangle } from 'lucide-react'

type Config = {
  id: string
  capacidadeMaxima: number
  capacidadeEfetiva: number
  tempoPermanenciaMin: number
  alertaCapacidadePct: number
} | null

export function ConfiguracaoCliente({ config }: { config: Config }) {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(formRef.current!)
    startTransition(async () => {
      const res = await atualizarConfig(fd)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Configurações salvas!')
    })
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Parâmetros de capacidade e operação do restaurante</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {config && <input type="hidden" name="id" value={config.id} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-400" />
                <Label htmlFor="capacidadeMaxima" className="font-semibold">Capacidade máxima</Label>
              </div>
              <Input
                id="capacidadeMaxima"
                name="capacidadeMaxima"
                type="number"
                min={1}
                defaultValue={config?.capacidadeMaxima ?? 77}
                required
              />
              <p className="text-xs text-gray-400">Máximo absoluto de pessoas no restaurante</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-400" />
                <Label htmlFor="capacidadeEfetiva" className="font-semibold">Capacidade efetiva</Label>
              </div>
              <Input
                id="capacidadeEfetiva"
                name="capacidadeEfetiva"
                type="number"
                min={1}
                defaultValue={config?.capacidadeEfetiva ?? 70}
                required
              />
              <p className="text-xs text-gray-400">Capacidade real considerando mesas juntas e layouts</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <Label htmlFor="tempoPermanenciaMin" className="font-semibold">Tempo de permanência (min)</Label>
              </div>
              <Input
                id="tempoPermanenciaMin"
                name="tempoPermanenciaMin"
                type="number"
                min={15}
                step={15}
                defaultValue={config?.tempoPermanenciaMin ?? 60}
                required
              />
              <p className="text-xs text-gray-400">Tempo médio que os clientes ficam no restaurante</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <Label htmlFor="alertaCapacidadePct" className="font-semibold">Alerta de capacidade (%)</Label>
              </div>
              <Input
                id="alertaCapacidadePct"
                name="alertaCapacidadePct"
                type="number"
                min={50}
                max={100}
                defaultValue={config?.alertaCapacidadePct ?? 85}
                required
              />
              <p className="text-xs text-gray-400">Percentual para acionar alerta de capacidade no painel da porta</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Settings className="w-4 h-4" />
              {pending ? 'Salvando...' : 'Salvar configurações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
