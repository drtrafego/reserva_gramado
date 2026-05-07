'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { ambientes, tiposMesa } from '@/lib/db/schema'

export async function criarAmbiente(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const permiteJuntarMesas = formData.get('permiteJuntarMesas') === 'true'
  const juntarApartirDeRaw = formData.get('juntarApartirDe')
  const juntarApartirDe = juntarApartirDeRaw ? Number(juntarApartirDeRaw) : null

  if (!nome) return { error: 'Nome obrigatório' }

  const [novo] = await db.insert(ambientes).values({
    nome,
    permiteJuntarMesas,
    juntarApartirDe,
    ativo: true,
  }).returning()

  revalidatePath('/admin/ambientes')
  return { success: true, id: novo.id }
}

export async function atualizarAmbiente(formData: FormData) {
  const id = String(formData.get('id'))
  const nome = String(formData.get('nome') ?? '').trim()
  const permiteJuntarMesas = formData.get('permiteJuntarMesas') === 'true'
  const juntarApartirDeRaw = formData.get('juntarApartirDe')
  const juntarApartirDe = juntarApartirDeRaw ? Number(juntarApartirDeRaw) : null

  if (!id || !nome) return { error: 'Campos obrigatórios' }

  await db
    .update(ambientes)
    .set({ nome, permiteJuntarMesas, juntarApartirDe, updatedAt: new Date() })
    .where(eq(ambientes.id, id))

  revalidatePath('/admin/ambientes')
  return { success: true }
}

export async function toggleAmbienteAtivo(id: string, ativo: boolean) {
  await db.update(ambientes).set({ ativo, updatedAt: new Date() }).where(eq(ambientes.id, id))
  revalidatePath('/admin/ambientes')
  return { success: true }
}

export async function adicionarTipoMesa(ambienteId: string, capacidade: number, quantidade: number) {
  if (!ambienteId || capacidade < 1 || quantidade < 1) return { error: 'Dados inválidos' }
  await db.insert(tiposMesa).values({ ambienteId, capacidade, quantidade })
  revalidatePath('/admin/ambientes')
  return { success: true }
}

export async function removerTipoMesa(id: string) {
  await db.delete(tiposMesa).where(eq(tiposMesa.id, id))
  revalidatePath('/admin/ambientes')
  return { success: true }
}
