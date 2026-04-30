import Link from 'next/link'
import { UtensilsCrossed, LayoutDashboard } from 'lucide-react'

export default function PortaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 h-13 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-gray-900 text-sm">Gramado Plazza</span>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Admin
        </Link>
      </header>
      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full flex flex-col">
        {children}
      </div>
    </div>
  )
}
