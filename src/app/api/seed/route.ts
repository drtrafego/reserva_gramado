import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas, restauranteConfig } from '@/lib/db/schema'
import { format } from 'date-fns'

function calc(adultos: number, criancas50: number, valor: number) {
  return String(adultos * valor + criancas50 * valor * 0.5)
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Não disponível em produção' }, { status: 403 })
  }

  const hoje = format(new Date(), 'yyyy-MM-dd')

  const configs = await db.select().from(restauranteConfig).limit(1)
  if (configs.length === 0) {
    await db.insert(restauranteConfig).values({
      capacidadeMaxima: 77,
      capacidadeEfetiva: 70,
      tempoPermanenciaMin: 60,
      alertaCapacidadePct: 85,
    })
  }

  await db.delete(reservas)

  await db.insert(reservas).values([
    {
      data: hoje, nomeCliente: 'Ana Paula Souza', telefone: '51 99123-4567',
      horarioReservado: '19:00', adultos: 4, criancas50pct: 0, criancasIsento: 0,
      valorPorPessoa: '69.90', valorTotal: calc(4, 0, 69.90),
      canalOrigem: 'reserva', status: 'pendente',
    },
    {
      data: hoje, nomeCliente: 'Carlos Mendes', telefone: '21 99764-1418',
      horarioReservado: '19:00', adultos: 2, criancas50pct: 0, criancasIsento: 0,
      pessoasChegada: 2, horarioChegada: '18:55',
      valorPorPessoa: '69.90', valorTotal: calc(2, 0, 69.90),
      canalOrigem: 'reserva', status: 'compareceu',
      observacoes: 'via site 20 de jul.',
    },
    {
      data: hoje, nomeCliente: 'Fernanda Lima', telefone: '47 9123-7007',
      horarioReservado: '19:30', adultos: 4, criancas50pct: 1, criancasIsento: 1,
      valorPorPessoa: '69.90', valorTotal: calc(4, 1, 69.90),
      canalOrigem: 'site', status: 'pendente',
    },
    {
      data: hoje, nomeCliente: 'Roberto Alves', telefone: '54 9927-7667',
      horarioReservado: '20:00', adultos: 3, criancas50pct: 0, criancasIsento: 0,
      valorPorPessoa: '79.90', valorTotal: calc(3, 0, 79.90),
      canalOrigem: 'reserva', status: 'pendente',
    },
    {
      data: hoje, nomeCliente: 'Juliana Costa', telefone: '61 9271-6391',
      horarioReservado: '20:00', adultos: 8, criancas50pct: 0, criancasIsento: 0,
      valorPorPessoa: '69.90', valorTotal: calc(8, 0, 69.90),
      canalOrigem: 'site', status: 'nao_compareceu',
    },
    {
      data: hoje, nomeCliente: null, telefone: null,
      horarioReservado: null, adultos: 3, criancas50pct: 0, criancasIsento: 2,
      pessoasChegada: 5, horarioChegada: '19:10',
      valorPorPessoa: '69.90', valorTotal: calc(3, 0, 69.90),
      canalOrigem: 'porta', status: 'compareceu',
    },
    {
      data: hoje, nomeCliente: 'Marcos Oliveira', telefone: '44 9883-4411',
      horarioReservado: '20:30', adultos: 2, criancas50pct: 0, criancasIsento: 0,
      valorPorPessoa: '69.90', valorTotal: calc(2, 0, 69.90),
      canalOrigem: 'reserva', status: 'pendente',
    },
    {
      data: hoje, nomeCliente: 'Patrícia Ramos', telefone: '48 8438-7445',
      horarioReservado: '21:00', adultos: 4, criancas50pct: 1, criancasIsento: 0,
      valorPorPessoa: '79.90', valorTotal: calc(4, 1, 79.90),
      canalOrigem: 'reserva', status: 'pendente',
    },
    {
      data: hoje, nomeCliente: null, telefone: null,
      horarioReservado: null, adultos: 2, criancas50pct: 0, criancasIsento: 1,
      pessoasChegada: 3, horarioChegada: '20:45',
      valorPorPessoa: '69.90', valorTotal: calc(2, 0, 69.90),
      canalOrigem: 'porta', status: 'compareceu',
    },
    {
      data: hoje, nomeCliente: 'Diego Santos', telefone: '51 8162-5160',
      horarioReservado: '21:30', adultos: 2, criancas50pct: 0, criancasIsento: 0,
      valorPorPessoa: '89.90', valorTotal: calc(2, 0, 89.90),
      canalOrigem: 'site', status: 'pendente',
    },
  ])

  return NextResponse.json({ ok: true, mensagem: `Seed criado para ${hoje} com 10 reservas` })
}
