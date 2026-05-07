'use server'

import { db } from '@/lib/db'
import { restauranteConfig } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

export async function atualizarConfig(formData: FormData) {
  const id = String(formData.get('id'))
  const capacidadeMaxima = Number(formData.get('capacidadeMaxima'))
  const capacidadeEfetiva = Number(formData.get('capacidadeEfetiva'))
  const tempoPermanenciaMin = Number(formData.get('tempoPermanenciaMin'))
  const tempoPermanenciaUnificadaMin = Number(formData.get('tempoPermanenciaUnificadaMin')) || 120
  const alertaCapacidadePct = Number(formData.get('alertaCapacidadePct'))
  const horarioInicio = String(formData.get('horarioInicio') || '18:00')
  const horarioFim = String(formData.get('horarioFim') || '22:00')
  const intervaloSlotMin = Number(formData.get('intervaloSlotMin')) || 30

  if (!capacidadeMaxima || !capacidadeEfetiva || !tempoPermanenciaMin || !alertaCapacidadePct) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  const valores = {
    capacidadeMaxima,
    capacidadeEfetiva,
    tempoPermanenciaMin,
    tempoPermanenciaUnificadaMin,
    alertaCapacidadePct,
    horarioInicio,
    horarioFim,
    intervaloSlotMin,
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(restauranteConfig).set(valores).where(eq(restauranteConfig.id, id))
  } else {
    await db.insert(restauranteConfig).values(valores)
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/porta')
  return { success: true }
}
