/**
 * Teste de stress: N requisições simultâneas para o mesmo horário.
 * Esperado: apenas as que cabem na capacidade passam (409 para o resto).
 *
 * Uso:
 *   node scripts/stress-test-reservas.mjs [qtd] [data] [horario]
 *
 * Exemplos:
 *   node scripts/stress-test-reservas.mjs 10
 *   node scripts/stress-test-reservas.mjs 15 2026-05-25 19:00
 */

const BASE_URL = 'https://reserva.gramadoplazza.com'
const API_KEY  = 'huLkLr9Y8rJdQQvIvlRFRjdsqOqMJUcQg08Dv8AXdGMrp6GB'

const QTD      = parseInt(process.argv[2] ?? '10', 10)
const DATA     = process.argv[3] ?? '2026-06-15'   // data futura sem reservas
const HORARIO  = process.argv[4] ?? '20:00'

const ADULTOS_POR_RESERVA = 2   // cada reserva pede 2 adultos → 10 reservas = 20 pessoas

// ─── helpers ────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0') }

async function criarReserva(indice) {
  const inicio = Date.now()
  const body = {
    data:             DATA,
    nomeCliente:      `Teste Stress ${pad(indice + 1)}`,
    telefone:         `549999${String(indice).padStart(5, '0')}`,
    horarioReservado: HORARIO,
    adultos:          ADULTOS_POR_RESERVA,
    criancasMeia:     0,
    criancasIsento:   0,
    criancasIntegral: 0,
    valorPorPessoa:   150,
    mesasUnificadas:  false,
    observacoes:      `Stress test #${pad(indice + 1)} — ${new Date().toISOString()}`,
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/reservas`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    const ms   = Date.now() - inicio
    const json = await res.json()
    return { indice, status: res.status, ms, json }
  } catch (err) {
    const ms = Date.now() - inicio
    return { indice, status: 'ERRO', ms, json: { erro: err.message } }
  }
}

// ─── execução ───────────────────────────────────────────────────────────────

console.log('═'.repeat(60))
console.log(`  STRESS TEST — Reservas simultâneas`)
console.log(`  URL:     ${BASE_URL}`)
console.log(`  Data:    ${DATA}   Horário: ${HORARIO}`)
console.log(`  Chamadas: ${QTD}   (${QTD * ADULTOS_POR_RESERVA} pessoas no total)`)
console.log(`  Capacidade do restaurante: 130 pessoas/dia`)
console.log('═'.repeat(60))
console.log()
console.log('Disparando todas as requisições ao mesmo tempo...')
console.log()

const promises = Array.from({ length: QTD }, (_, i) => criarReserva(i))
const resultados = await Promise.all(promises)

// ─── relatório ──────────────────────────────────────────────────────────────

const criadas   = resultados.filter(r => r.status === 201)
const sem_vaga  = resultados.filter(r => r.status === 409)
const erros     = resultados.filter(r => r.status !== 201 && r.status !== 409)

const tempos    = resultados.map(r => r.ms)
const mediaMs   = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
const minMs     = Math.min(...tempos)
const maxMs     = Math.max(...tempos)

console.log('RESULTADOS INDIVIDUAIS:')
console.log('─'.repeat(60))
for (const r of resultados.sort((a, b) => a.indice - b.indice)) {
  const icone  = r.status === 201 ? '✓' : r.status === 409 ? '✗' : '!'
  const label  = r.status === 201
    ? `CRIADA  — id: ${r.json?.reserva?.id ?? '?'}`
    : r.status === 409
    ? `SEM VAGA — disponivel: ${r.json?.disponivel ?? '?'}, solicitado: ${r.json?.solicitado ?? '?'}`
    : `ERRO ${r.status} — ${JSON.stringify(r.json)}`
  console.log(`  [${icone}] #${pad(r.indice + 1)} (${r.ms}ms)  ${label}`)
}

console.log()
console.log('RESUMO:')
console.log('─'.repeat(60))
console.log(`  Chamadas disparadas: ${QTD}`)
console.log(`  Criadas (201):       ${criadas.length}`)
console.log(`  Sem vaga (409):      ${sem_vaga.length}`)
console.log(`  Outros erros:        ${erros.length}`)
console.log()
console.log(`  Tempo mínimo:  ${minMs}ms`)
console.log(`  Tempo máximo:  ${maxMs}ms`)
console.log(`  Tempo médio:   ${mediaMs}ms`)
console.log()

if (erros.length > 0) {
  console.log('ERROS INESPERADOS:')
  console.log('─'.repeat(60))
  for (const e of erros) {
    console.log(`  #${pad(e.indice + 1)} status=${e.status}`, JSON.stringify(e.json, null, 2))
  }
  console.log()
}

// ─── validação da atomicidade ────────────────────────────────────────────────

const pessoasAceitas = criadas.length * ADULTOS_POR_RESERVA
console.log('VALIDAÇÃO DA ATOMICIDADE:')
console.log('─'.repeat(60))
if (pessoasAceitas <= 130) {
  console.log(`  OK — ${pessoasAceitas} pessoas aceitas, dentro da capacidade de 130.`)
  if (criadas.length + sem_vaga.length === QTD) {
    console.log(`  OK — Todas as chamadas retornaram 201 ou 409, sem duplicatas ou estados indefinidos.`)
  }
} else {
  console.log(`  FALHA — ${pessoasAceitas} pessoas aceitas, acima da capacidade de 130!`)
  console.log(`  O INSERT atômico falhou. Verificar lógica de concorrência no servidor.`)
}
console.log()
