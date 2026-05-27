export function totalPessoas(r: {
  adultos: number
  criancas50pct: number
  criancasIsento: number
  criancasIntegral: number
  pessoasChegada?: number | null
}): number {
  return r.pessoasChegada ?? (r.adultos + r.criancas50pct + r.criancasIsento + r.criancasIntegral)
}

export function calcularDuracaoMin(
  pessoas: number,
  config: { tempoPermanenciaMin: number; tempoPermanenciaUnificadaMin: number; limitePessoasGrupoGrande: number }
): number {
  return pessoas >= config.limitePessoasGrupoGrande
    ? config.tempoPermanenciaUnificadaMin
    : config.tempoPermanenciaMin
}
