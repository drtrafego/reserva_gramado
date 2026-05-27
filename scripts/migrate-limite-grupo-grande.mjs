import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

const result = await sql`
  ALTER TABLE restaurante_config ADD COLUMN IF NOT EXISTS limite_pessoas_grupo_grande INTEGER NOT NULL DEFAULT 5
`

console.log('Migração executada com sucesso:', result)
