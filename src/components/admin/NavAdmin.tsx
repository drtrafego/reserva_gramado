'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CalendarDays, PlusCircle, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/admin/reservas/nova', label: 'Nova Reserva', icon: PlusCircle },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function isActive(href: string, pathname: string) {
  if (href === '/admin') return pathname === '/admin'
  if (href === '/admin/reservas') return pathname === '/admin/reservas'
  return pathname === href || pathname.startsWith(href + '/')
}

export function NavAdmin() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-0.5 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                  active
                    ? 'text-emerald-700 border-emerald-600 bg-emerald-50/40'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
