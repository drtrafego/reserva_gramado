import Link from 'next/link'
import { UtensilsCrossed, LayoutDashboard } from 'lucide-react'

export default function PortaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-950 px-4 h-14 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Gramado Plazza</p>
            <p className="text-gray-400 text-xs leading-tight">Painel da Porta</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg font-medium"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Admin
        </Link>
      </header>
      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full flex flex-col">
        {children}
      </div>
    </div>
  )
}
