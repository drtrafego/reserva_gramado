import { z } from 'zod'

export const confirmarChegadaSchema = z.object({
  id: z.string().uuid(),
  pessoasChegada: z.coerce.number().int().min(1, 'Informe pelo menos 1 pessoa'),
  horarioChegada: z.string().optional(),
  observacoes: z.string().max(500).optional(),
})

export const entradaPortaSchema = z.object({
  nomeCliente: z.string().max(150).optional(),
  adultos: z.coerce.number().int().min(1, 'Mínimo 1 adulto'),
  criancas50pct: z.coerce.number().int().min(0).default(0),
  criancasIsento: z.coerce.number().int().min(0).default(0),
  valorPorPessoa: z.coerce.number().min(0).optional(),
  observacoes: z.string().max(500).optional(),
})

export const novaReservaSchema = z.object({
  data: z.string().min(1, 'Data obrigatória'),
  nomeCliente: z.string().min(1, 'Nome obrigatório').max(150),
  telefone: z.string().max(20).optional(),
  horarioReservado: z.string().min(1, 'Horário obrigatório'),
  adultos: z.coerce.number().int().min(1, 'Mínimo 1 adulto'),
  criancas50pct: z.coerce.number().int().min(0).default(0),
  criancasIsento: z.coerce.number().int().min(0).default(0),
  valorPorPessoa: z.coerce.number().min(0),
  canalOrigem: z.enum(['reserva', 'porta', 'site']),
  observacoes: z.string().max(500).optional(),
})

export type ConfirmarChegadaInput = z.infer<typeof confirmarChegadaSchema>
export type EntradaPortaInput = z.infer<typeof entradaPortaSchema>
export type NovaReservaInput = z.infer<typeof novaReservaSchema>
