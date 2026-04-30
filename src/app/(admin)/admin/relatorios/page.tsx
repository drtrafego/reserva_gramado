import { getRelatorioMensal } from '@/lib/db/queries'
import { RelatorioMensal } from '@/components/admin/RelatorioMensal'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ mes?: string; ano?: string }>
}

export default async function RelatoriosPage({ searchParams }: Props) {
  const params = await searchParams
  const agora = new Date()
  const mes = Number(params.mes ?? agora.getMonth() + 1)
  const ano = Number(params.ano ?? agora.getFullYear())

  const relatorio = await getRelatorioMensal(ano, mes)

  return <RelatorioMensal relatorio={relatorio} mes={mes} ano={ano} />
}
