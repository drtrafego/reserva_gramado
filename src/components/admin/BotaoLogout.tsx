'use client'

import { useUser } from '@stackframe/stack'
import { LogOut } from 'lucide-react'

export function BotaoLogout() {
  const user = useUser()

  if (!user) return null

  return (
    <button
      onClick={() => user.signOut()}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sair
    </button>
  )
}
