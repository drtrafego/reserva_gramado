import { NextRequest } from 'next/server'
import { validarApiKey, respostaErro } from '@/lib/api/auth'
import { getSlotsDisponiveis } from '@/lib/db/queries'

export async function GET(req: NextRequest) {
  if (!validarApiKey(req)) return respostaErro('Não autorizado', 401)

  const { searchParams } = new URL(req.url)
  const data = searchParams.get('data')
  const pessoasParam = searchParams.get('pessoas')
  const horarioDesejado = searchParams.get('horario')

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return respostaErro('Parâmetro "data" obrigatório no formato YYYY-MM-DD', 400)
  }

  const pessoas = pessoasParam ? parseInt(pessoasParam, 10) : 1

  const slots = await getSlotsDisponiveis(data, pessoas)

  if (horarioDesejado) {
    const slotDesejado = slots.find((s) => s.horario === horarioDesejado)
    const disponiveis = slots.filter((s) => s.disponivel)

    if (slotDesejado?.disponivel) {
      return Response.json({ slots, slotDesejado, disponivel: true, sugestoes: [] })
    }

    const [hD, mD] = horarioDesejado.split(':').map(Number)
    const minDesejado = hD * 60 + mD

    const sugestoes = disponiveis
      .map((s) => {
        const [h, m] = s.horario.split(':').map(Number)
        const min = h * 60 + m
        return { ...s, diff: Math.abs(min - minDesejado) }
      })
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
      .map((s) => s.horario)

    return Response.json({ slots, slotDesejado, disponivel: false, sugestoes })
  }

  return Response.json({ slots, sugestoes: slots.filter((s) => s.disponivel).map((s) => s.horario) })
}
