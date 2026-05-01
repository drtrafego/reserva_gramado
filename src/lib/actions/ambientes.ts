'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { ambientes } from '@/lib/db/schema'

export async function criarAmbiente(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const qtdMesas = Number(formData.get('qtdMesas'))
  const capacidadePessoas = Number(formData.get('capacidadePessoas'))
  const permiteJuntarMesas = formData.get('permiteJuntarMesas') === 'true'
  const juntarApartirDeRaw = formData.get('juntarApartirDe')
  const juntarApartirDe = juntarApartirDeRaw ? Number(juntarApartirDeRaw) : null

  if (!nome || !qtdMesas || !capacidadePessoas) return { error: 'Campos obrigatórios' }

  await db.insert(ambientes).values({
    nome,
    qtdMesas,
    capacidadePessoas,
    permiteJuntarMesas,
    juntarApartirDe,
    ativo: true,
  })

  revalidatePath('/admin/ambientes')
  return { success: true }
}

export async function atualizarAmbiente(formData: FormData) {
  const id = String(formData.get('id'))
  const nome = String(formData.get('nome') ?? '').trim()
  const qtdMesas = Number(formData.get('qtdMesas'))
  const capacidadePessoas = Number(formData.get('capacidadePessoas'))
  const permiteJuntarMesas = formData.get('permiteJuntarMesas') === 'true'
  const juntarApartirDeRaw = formData.get('juntarApartirDe')
  const juntarApartirDe = juntarApartirDeRaw ? Number(juntarApartirDeRaw) : null

  if (!id || !nome || !qtdMesas || !capacidadePessoas) return { error: 'Campos obrigatórios' }

  await db
    .update(ambientes)
    .set({ nome, qtdMesas, capacidadePessoas, permiteJuntarMesas, juntarApartirDe, updatedAt: new Date() })
    .where(eq(ambientes.id, id))

  revalidatePath('/admin/ambientes')
  return { success: true }
}

export async function toggleAmbienteAtivo(id: string, ativo: boolean) {
  await db.update(ambientes).set({ ativo, updatedAt: new Date() }).where(eq(ambientes.id, id))
  revalidatePath('/admin/ambientes')
  return { success: true }
}
