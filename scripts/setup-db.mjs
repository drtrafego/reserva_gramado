import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_t8BWCYJRbrD4@ep-patient-voice-amts8e2z-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function run() {
  console.log('Criando tabelas...')

  await sql`
    CREATE TABLE IF NOT EXISTS restaurante_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      capacidade_maxima INTEGER NOT NULL DEFAULT 77,
      capacidade_efetiva INTEGER NOT NULL DEFAULT 70,
      tempo_permanencia_min INTEGER NOT NULL DEFAULT 60,
      alerta_capacidade_pct INTEGER NOT NULL DEFAULT 85,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✓ restaurante_config')

  await sql`
    CREATE TABLE IF NOT EXISTS ambientes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(100) NOT NULL,
      qtd_mesas INTEGER NOT NULL,
      capacidade_pessoas INTEGER NOT NULL,
      permite_juntar_mesas BOOLEAN DEFAULT FALSE,
      juntar_a_partir_de INTEGER,
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✓ ambientes')

  await sql`
    CREATE TABLE IF NOT EXISTS reservas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data DATE NOT NULL,
      nome_cliente VARCHAR(150),
      telefone VARCHAR(20),
      horario_reservado TIME,
      horario_chegada TIME,
      adultos INTEGER NOT NULL DEFAULT 1,
      criancas_50pct INTEGER NOT NULL DEFAULT 0,
      criancas_isento INTEGER NOT NULL DEFAULT 0,
      pessoas_chegada INTEGER,
      valor_por_pessoa DECIMAL(10,2),
      valor_total DECIMAL(10,2),
      canal_origem canal_origem NOT NULL,
      status status_reserva NOT NULL DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `
  console.log('✓ reservas')

  await sql`CREATE INDEX IF NOT EXISTS idx_reservas_data ON reservas(data)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reservas_data_status ON reservas(data, status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reservas_data_canal ON reservas(data, canal_origem)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reservas_data_horario ON reservas(data, horario_reservado)`
  console.log('✓ índices')

  const config = await sql`SELECT 1 FROM restaurante_config LIMIT 1`
  if (config.length === 0) {
    await sql`INSERT INTO restaurante_config (capacidade_maxima, capacidade_efetiva, tempo_permanencia_min, alerta_capacidade_pct) VALUES (77, 70, 60, 85)`
    console.log('✓ config inicial inserida')
  } else {
    console.log('✓ config já existe')
  }

  await sql`DELETE FROM reservas WHERE data = '2026-05-01'`

  await sql`
    INSERT INTO reservas (data, nome_cliente, telefone, horario_reservado, adultos, criancas_50pct, criancas_isento, valor_por_pessoa, valor_total, canal_origem, status) VALUES
    ('2026-05-01', 'Ana Paula Souza', '51 99123-4567', '19:00', 4, 0, 0, 69.90, 279.60, 'reserva', 'pendente'),
    ('2026-05-01', 'Carlos Mendes', '21 99764-1418', '19:00', 2, 0, 0, 69.90, 139.80, 'reserva', 'compareceu'),
    ('2026-05-01', 'Fernanda Lima', '47 99123-7007', '19:30', 4, 1, 1, 69.90, 314.55, 'site', 'pendente'),
    ('2026-05-01', 'Roberto Alves', '54 99927-7667', '20:00', 3, 0, 0, 79.90, 239.70, 'reserva', 'pendente'),
    ('2026-05-01', 'Juliana Costa', '61 99271-6391', '20:00', 8, 0, 0, 69.90, 559.20, 'site', 'nao_compareceu'),
    ('2026-05-01', NULL, NULL, NULL, 3, 0, 2, 69.90, 209.70, 'porta', 'compareceu'),
    ('2026-05-01', 'Marcos Oliveira', '44 99883-4411', '20:30', 2, 0, 0, 69.90, 139.80, 'reserva', 'pendente'),
    ('2026-05-01', 'Patricia Ramos', '48 98438-7445', '21:00', 4, 1, 0, 79.90, 359.55, 'reserva', 'pendente'),
    ('2026-05-01', NULL, NULL, NULL, 2, 0, 1, 69.90, 139.80, 'porta', 'compareceu'),
    ('2026-05-01', 'Diego Santos', '51 98162-5160', '21:30', 2, 0, 0, 89.90, 179.80, 'site', 'pendente')
  `
  console.log('✓ 10 reservas de teste inseridas para hoje')

  console.log('\nBanco configurado com sucesso!')
}

run().catch((e) => { console.error('ERRO:', e.message); process.exit(1) })
