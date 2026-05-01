import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { StackProvider, StackTheme } from '@stackframe/stack'
import { stackServerApp } from '@/stack'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gramado Reserva',
  description: 'Sistema de controle de reservas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const children_ = (
    <>
      {children}
      <Toaster richColors position="top-center" />
    </>
  )

  if (!stackServerApp) {
    return (
      <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">{children_}</body>
      </html>
    )
  }

  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <StackProvider app={stackServerApp as any}>
          <StackTheme>{children_}</StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}
