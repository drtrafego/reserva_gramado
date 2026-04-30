import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  date,
  time,
  decimal,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'

export const canalOrigemEnum = pgEnum('canal_origem', ['reserva', 'porta', 'site'])
export const statusReservaEnum = pgEnum('status_reserva', [
  'pendente',
  'compareceu',
  'nao_compareceu',
  'cancelou',
])

export const restauranteConfig = pgTable('restaurante_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  capacidadeMaxima: integer('capacidade_maxima').notNull().default(77),
  capacidadeEfetiva: integer('capacidade_efetiva').notNull().default(70),
  tempoPermanenciaMin: integer('tempo_permanencia_min').notNull().default(60),
  alertaCapacidadePct: integer('alerta_capacidade_pct').notNull().default(85),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const ambientes = pgTable('ambientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 100 }).notNull(),
  qtdMesas: integer('qtd_mesas').notNull(),
  capacidadePessoas: integer('capacidade_pessoas').notNull(),
  permiteJuntarMesas: boolean('permite_juntar_mesas').default(false),
  juntarApartirDe: integer('juntar_a_partir_de'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const reservas = pgTable(
  'reservas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    data: date('data').notNull(),
    nomeCliente: varchar('nome_cliente', { length: 150 }),
    telefone: varchar('telefone', { length: 20 }),
    horarioReservado: time('horario_reservado'),
    horarioChegada: time('horario_chegada'),
    adultos: integer('adultos').notNull().default(1),
    criancas50pct: integer('criancas_50pct').notNull().default(0),
    criancasIsento: integer('criancas_isento').notNull().default(0),
    pessoasChegada: integer('pessoas_chegada'),
    valorPorPessoa: decimal('valor_por_pessoa', { precision: 10, scale: 2 }),
    valorTotal: decimal('valor_total', { precision: 10, scale: 2 }),
    canalOrigem: canalOrigemEnum('canal_origem').notNull(),
    status: statusReservaEnum('status').notNull().default('pendente'),
    observacoes: text('observacoes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('idx_reservas_data').on(t.data),
    index('idx_reservas_data_status').on(t.data, t.status),
    index('idx_reservas_data_canal').on(t.data, t.canalOrigem),
    index('idx_reservas_data_horario').on(t.data, t.horarioReservado),
  ]
)

export type Reserva = typeof reservas.$inferSelect
export type NovaReserva = typeof reservas.$inferInsert
export type CanalOrigem = (typeof canalOrigemEnum.enumValues)[number]
export type StatusReserva = (typeof statusReservaEnum.enumValues)[number]
