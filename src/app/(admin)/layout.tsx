import Link from 'next/link'
import { LayoutDashboard, CalendarDays, PlusCircle, BarChart3, UtensilsCrossed } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/admin/reservas/nova', label: 'Nova Reserva', icon: PlusCircle },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-gray-900">Gramado Plazza</span>
          </div>
          <Link
            href="/porta"
            className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Painel da Porta
          </Link>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-gray-600 hover:text-emerald-700 whitespace-nowrap border-b-2 border-transparent hover:border-emerald-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
