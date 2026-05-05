import { NextRequest } from 'next/server'

export function validarApiKey(req: NextRequest): boolean {
  const apiKey = process.env.WEBHOOK_API_KEY
  if (!apiKey) return false

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  return token === apiKey
}

export function respostaErro(mensagem: string, status: number) {
  return Response.json({ erro: mensagem }, { status })
}
