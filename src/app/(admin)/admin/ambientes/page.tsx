import { getAmbientes } from '@/lib/db/queries'
import { AmbientesCliente } from '@/components/admin/AmbientesCliente'

export const dynamic = 'force-dynamic'

export default async function AmbientesPage() {
  const lista = await getAmbientes()
  return <AmbientesCliente ambientes={lista} />
}
