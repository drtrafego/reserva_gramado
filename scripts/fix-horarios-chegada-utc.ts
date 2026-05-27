import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })
import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '../src/lib/db'
import { reservas } from '../src/lib/db/schema'

const APPLY = process.argv.includes('--apply')

function subtrair3h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  let novaH = h - 3
  if (novaH < 0) novaH += 24
  return `${String(novaH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

async function main() {
  console.log(APPLY ? 'MODO: APPLY (vai alterar dados)' : 'MODO: DRY-RUN (nada sera alterado)')
  console.log('Buscando reservas com horarioChegada entre 00:00 e 04:00 e status=compareceu...\n')

  const candidatas = await db
    .select()
    .from(reservas)
    .where(
      and(
        eq(reservas.status, 'compareceu'),
        gte(reservas.horarioChegada, '00:00:00'),
        lte(reservas.horarioChegada, '04:00:00')
      )
    )

  if (candidatas.length === 0) {
    console.log('Nenhuma reserva encontrada no range suspeito.')
    return
  }

  console.log(`Encontradas ${candidatas.length} reservas:\n`)

  for (const r of candidatas) {
    if (!r.horarioChegada) continue
    const horaAtual = r.horarioChegada.slice(0, 5)
    const horaNova = subtrair3h(horaAtual)
    console.log(
      `- ${r.nomeCliente ?? '(sem nome)'} | data=${r.data} | reserva=${r.horarioReservado ?? '-'} | chegada ${horaAtual} -> ${horaNova} | id=${r.id}`
    )

    if (APPLY) {
      await db
        .update(reservas)
        .set({ horarioChegada: horaNova, updatedAt: new Date() })
        .where(eq(reservas.id, r.id))
    }
  }

  console.log(`\n${APPLY ? 'Aplicado em' : 'Seria aplicado em'} ${candidatas.length} reserva(s).`)
  if (!APPLY) console.log('Para aplicar de verdade: pnpm tsx scripts/fix-horarios-chegada-utc.ts --apply')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
