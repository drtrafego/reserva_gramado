import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

const result = await sql`
  ALTER TABLE reservas ADD COLUMN IF NOT EXISTS criancas_integral INTEGER NOT NULL DEFAULT 0
`

console.log('Migração executada com sucesso:', result)
