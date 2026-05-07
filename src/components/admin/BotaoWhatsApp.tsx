'use client'

import { MessageCircle } from 'lucide-react'
import type { Reserva } from '@/lib/db/schema'

interface Props {
  reserva: Reserva
}

function limparTelefone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return '55' + digits
}

function gerarMsgWhatsApp(reserva: Reserva): string {
  const nome = reserva.nomeCliente ?? 'cliente'
  const parteNome = nome.split(' ')[0]
  const totalPessoas = reserva.adultos + reserva.criancas50pct + reserva.criancasIsento

  const [ano, mes, dia] = reserva.data.split('-')
  const dataFormatada = `${dia}/${mes}/${ano}`
  const horario = reserva.horarioReservado ?? ''

  const linhas = [
    `Olá, ${parteNome}! Tudo bem?`,
    ``,
    `Passando para confirmar sua reserva no *Gramado Plazza*:`,
    `📅 *Data:* ${dataFormatada}`,
    horario ? `🕐 *Horário:* ${horario}` : null,
    `👥 *Pessoas:* ${totalPessoas}`,
    ``,
    `Você confirma a presença? Responda *SIM* para confirmar ou *NÃO* caso precise cancelar.`,
    ``,
    `Qualquer dúvida estamos à disposição! 😊`,
  ].filter((l) => l !== null).join('\n')

  return encodeURIComponent(linhas)
}

export function BotaoWhatsApp({ reserva }: Props) {
  if (!reserva.telefone || reserva.canalOrigem === 'porta') return <span className="text-gray-300">-</span>

  const url = `https://wa.me/${limparTelefone(reserva.telefone)}?text=${gerarMsgWhatsApp(reserva)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
    >
      <MessageCircle className="w-3.5 h-3.5" />
      WhatsApp
    </a>
  )
}
