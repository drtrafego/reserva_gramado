import { Suspense } from 'react'
import Link from 'next/link'
import { UtensilsCrossed } from 'lucide-react'
import { BotaoLogout } from '@/components/admin/BotaoLogout'
import { NavAdmin } from '@/components/admin/NavAdmin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Gramado Plazza</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/porta"
              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-500 transition-colors"
            >
              Painel da Porta
            </Link>
            <Suspense><BotaoLogout /></Suspense>
          </div>
        </div>
      </header>

      <NavAdmin />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
