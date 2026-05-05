import { NextRequest } from 'next/server'
import { validarApiKey, respostaErro } from '@/lib/api/auth'
import { getConfig, getCapacidadeOcupada } from '@/lib/db/queries'

export async function GET(req: NextRequest) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data')

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return respostaErro('Parâmetro "data" obrigatório no formato YYYY-MM-DD', 400)
  }

  const [config, ocupado] = await Promise.all([
    getConfig(),
    getCapacidadeOcupada(data),
  ])

  if (!config) return respostaErro('Configuração do restaurante não encontrada', 500)

  const disponivel = Math.max(0, config.capacidadeEfetiva - ocupado)
  const percentualOcupacao = Math.round((ocupado / config.capacidadeEfetiva) * 100)
  const alerta = percentualOcupacao >= config.alertaCapacidadePct

  return Response.json({
    data,
    capacidadeMaxima: config.capacidadeMaxima,
    capacidadeEfetiva: config.capacidadeEfetiva,
    ocupado,
    disponivel,
    percentualOcupacao,
    alerta,
    esgotado: disponivel === 0,
  })
}
