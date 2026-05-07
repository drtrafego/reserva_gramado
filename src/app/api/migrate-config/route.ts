import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { restauranteConfig } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await db.select().from(restauranteConfig).limit(1)

  if (rows.length === 0) {
    await db.insert(restauranteConfig).values({
      capacidadeMaxima: 130,
      capacidadeEfetiva: 130,
      tempoPermanenciaMin: 90,
      tempoPermanenciaUnificadaMin: 120,
      alertaCapacidadePct: 85,
      horarioInicio: '18:00',
      horarioFim: '22:00',
      intervaloSlotMin: 30,
    })
    return NextResponse.json({ ok: true, action: 'created' })
  }

  await db.execute(sql`
    UPDATE restaurante_config SET
      capacidade_maxima = 130,
      capacidade_efetiva = 130,
      tempo_permanencia_min = 90,
      tempo_permanencia_unificada_min = 120,
      horario_inicio = '18:00',
      horario_fim = '22:00',
      intervalo_slot_min = 30,
      updated_at = NOW()
  `)

  return NextResponse.json({ ok: true, action: 'updated', config: rows[0] })
}
