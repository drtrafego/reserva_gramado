'use client'

import { LogOut } from 'lucide-react'

export function BotaoLogout() {
  const hasAuth = !!(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
  )

  if (!hasAuth) return null

  return <BotaoLogoutAuth />
}

function BotaoLogoutAuth() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useUser } = require('@stackframe/stack')
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
