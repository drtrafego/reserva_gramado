import { neon } from '@neondatabase/serverless'

const sql = neon('postgresql://neondb_owner:npg_t8BWCYJRbrD4@ep-patient-voice-amts8e2z-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require')

const config = await sql`SELECT * FROM restaurante_config LIMIT 1`
console.log('Config:', config[0])

const reservas = await sql`SELECT status, canal_origem, COUNT(*) as qtd, SUM(valor_total) as total FROM reservas WHERE data = '2026-05-01' GROUP BY status, canal_origem ORDER BY status`
console.log('\nReservas por status e canal:')
reservas.forEach(r => console.log(` ${r.status} / ${r.canal_origem}: ${r.qtd} reservas = R$ ${Number(r.total).toFixed(2)}`))

const resumo = await sql`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'compareceu' THEN 1 ELSE 0 END) as compareceu,
    SUM(CASE WHEN status = 'nao_compareceu' THEN 1 ELSE 0 END) as nao_compareceu,
    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendente,
    SUM(CASE WHEN status = 'compareceu' THEN valor_total::numeric ELSE 0 END) as receita,
    SUM(CASE WHEN status = 'nao_compareceu' THEN valor_total::numeric ELSE 0 END) as perdido
  FROM reservas WHERE data = '2026-05-01'
`
const r = resumo[0]
console.log('\nResumo do dashboard:')
console.log(` Total: ${r.total} | Compareceu: ${r.compareceu} | Não veio: ${r.nao_compareceu} | Pendente: ${r.pendente}`)
console.log(` Receita: R$ ${Number(r.receita).toFixed(2)} | Perdido: R$ ${Number(r.perdido).toFixed(2)}`)
