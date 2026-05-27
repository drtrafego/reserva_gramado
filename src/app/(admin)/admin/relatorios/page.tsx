import { getRelatorioMensal } from '@/lib/db/queries'
import { RelatorioMensal } from '@/components/admin/RelatorioMensal'
import { nowPartsBR } from '@/lib/tz'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ mes?: string; ano?: string }>
}

export default async function RelatoriosPage({ searchParams }: Props) {
  const params = await searchParams
  const { ano: anoBR, mes: mesBR } = nowPartsBR()
  const mes = Number(params.mes ?? mesBR)
  const ano = Number(params.ano ?? anoBR)

  const relatorio = await getRelatorioMensal(ano, mes)

  return <RelatorioMensal relatorio={relatorio} mes={mes} ano={ano} />
}
