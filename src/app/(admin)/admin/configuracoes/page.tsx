import { getConfig } from '@/lib/db/queries'
import { ConfiguracaoCliente } from '@/components/admin/ConfiguracaoCliente'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const config = await getConfig()
  return <ConfiguracaoCliente config={config} />
}
