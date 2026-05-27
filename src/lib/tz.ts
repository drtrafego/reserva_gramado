import { formatInTimeZone } from 'date-fns-tz'

export const TZ_BRASIL = 'America/Sao_Paulo'

export function horaAgoraBR(): string {
  return formatInTimeZone(new Date(), TZ_BRASIL, 'HH:mm')
}

export function dataHojeBR(): string {
  return formatInTimeZone(new Date(), TZ_BRASIL, 'yyyy-MM-dd')
}

export function nowPartsBR() {
  const ano = Number(formatInTimeZone(new Date(), TZ_BRASIL, 'yyyy'))
  const mes = Number(formatInTimeZone(new Date(), TZ_BRASIL, 'MM'))
  return { ano, mes }
}
