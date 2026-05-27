import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })
import { seedAmbientes, type SeedAmbiente, type SeedMode } from '../src/lib/db/seed-helpers'

const modeArg = process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1]
const mode: SeedMode = (modeArg === 'replace' || modeArg === 'append' ? modeArg : 'skip')

const dados: SeedAmbiente[] = [
  {
    nome: 'Salão Interno',
    permiteJuntarMesas: true,
    juntarApartirDe: null,
    mesas: [
      { capacidade: 2, quantidade: 4 },
      { capacidade: 4, quantidade: 7 },
      { capacidade: 6, quantidade: 3 },
    ],
  },
  {
    nome: 'Deck de Vidro',
    permiteJuntarMesas: false,
    juntarApartirDe: null,
    mesas: [
      { capacidade: 3, quantidade: 2 },
      { capacidade: 4, quantidade: 4 },
    ],
  },
]

// Planta: 76 lugares físicos sentados (14m/54p Salão + 6m/22p Deck).
// restaurante_config.capacidadeMaxima=130 é proposital: contempla a rotatividade
// ao longo do serviço (18h-22h, permanência 90min ~1.7x giro). Não ajustar.

async function main() {
  console.log(`Modo: ${mode}`)
  const r = await seedAmbientes(dados, { mode })
  console.log('Criados:', r.created)
  console.log('Pulados:', r.skipped)
  console.log('Substituidos:', r.replaced)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
