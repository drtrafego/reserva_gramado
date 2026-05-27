import { sql } from 'drizzle-orm'
import { db } from './index'
import { ambientes, tiposMesa } from './schema'

export type SeedMesa = { capacidade: number; quantidade: number }

export type SeedAmbiente = {
  nome: string
  permiteJuntarMesas: boolean
  juntarApartirDe?: number | null
  mesas: SeedMesa[]
}

export type SeedMode = 'skip' | 'replace' | 'append'

export type SeedResult = {
  created: string[]
  skipped: string[]
  replaced: string[]
}

function validarAmbiente(a: SeedAmbiente): string | null {
  if (!a.nome || a.nome.trim().length === 0) return 'nome vazio'
  if (!Array.isArray(a.mesas) || a.mesas.length === 0) return 'sem mesas'
  for (const m of a.mesas) {
    if (!Number.isInteger(m.capacidade) || m.capacidade <= 0) {
      return `capacidade invalida (${m.capacidade}) em ${a.nome}`
    }
    if (!Number.isInteger(m.quantidade) || m.quantidade <= 0) {
      return `quantidade invalida (${m.quantidade}) em ${a.nome}`
    }
  }
  return null
}

async function findAmbienteByNome(nome: string) {
  const rows = await db
    .select({ id: ambientes.id })
    .from(ambientes)
    .where(sql`lower(${ambientes.nome}) = lower(${nome})`)
    .limit(1)
  return rows[0]?.id ?? null
}

async function criarAmbienteComMesas(a: SeedAmbiente): Promise<void> {
  const [inserido] = await db
    .insert(ambientes)
    .values({
      nome: a.nome,
      permiteJuntarMesas: a.permiteJuntarMesas,
      juntarApartirDe: a.juntarApartirDe ?? null,
    })
    .returning({ id: ambientes.id })

  if (!inserido) throw new Error(`Falha ao criar ambiente ${a.nome}`)

  if (a.mesas.length > 0) {
    await db.insert(tiposMesa).values(
      a.mesas.map((m) => ({
        ambienteId: inserido.id,
        capacidade: m.capacidade,
        quantidade: m.quantidade,
      })),
    )
  }
}

export async function seedAmbientes(
  ambientesData: SeedAmbiente[],
  opts: { mode?: SeedMode } = {},
): Promise<SeedResult> {
  const mode: SeedMode = opts.mode ?? 'skip'
  const result: SeedResult = { created: [], skipped: [], replaced: [] }

  for (const a of ambientesData) {
    const erro = validarAmbiente(a)
    if (erro) throw new Error(`Ambiente invalido: ${erro}`)

    const existenteId = mode === 'append' ? null : await findAmbienteByNome(a.nome)

    if (existenteId && mode === 'skip') {
      result.skipped.push(a.nome)
      continue
    }

    if (existenteId && mode === 'replace') {
      await db.delete(ambientes).where(sql`${ambientes.id} = ${existenteId}`)
      await criarAmbienteComMesas(a)
      result.replaced.push(a.nome)
      continue
    }

    await criarAmbienteComMesas(a)
    result.created.push(a.nome)
  }

  return result
}
