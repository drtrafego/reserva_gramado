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
  const alertaCapacidadePct = Number(formData.get('alertaCapacidadePct'))

  if (!capacidadeMaxima || !capacidadeEfetiva || !tempoPermanenciaMin || !alertaCapacidadePct) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  if (id) {
    await db
      .update(restauranteConfig)
      .set({ capacidadeMaxima, capacidadeEfetiva, tempoPermanenciaMin, alertaCapacidadePct, updatedAt: new Date() })
      .where(eq(restauranteConfig.id, id))
  } else {
    await db.insert(restauranteConfig).values({ capacidadeMaxima, capacidadeEfetiva, tempoPermanenciaMin, alertaCapacidadePct })
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/porta')
  return { success: true }
}
