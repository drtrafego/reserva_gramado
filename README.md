# Gramado Reserva

Sistema de controle de reservas do restaurante **Gramado Plazza** (Gramado, RS).

**Produção:** https://reserva.gramadoplazza.com
**Repositório:** drtrafego/reserva_gramado

---

## Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript strict
- Drizzle ORM + Neon PostgreSQL
- shadcn/ui + Tailwind CSS v4
- Stack Auth
- Vercel (deploy)
- pnpm

---

## Rodar localmente

```bash
pnpm install
pnpm dev
```

Crie um `.env.local` com:

```
DATABASE_URL=postgresql://...
WEBHOOK_API_KEY=sua-chave-aqui
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

---

## Banco de dados

```bash
# Aplicar alterações de schema
pnpm db:push

# Abrir studio visual
pnpm db:studio
```

---

## Estrutura de rotas

| Rota | Descricao |
|---|---|
| `/porta` | Painel do funcionário na porta (tablet) |
| `/admin` | Dashboard do dia |
| `/admin/reservas` | Listagem e criação de reservas |
| `/admin/ambientes` | Gestão de ambientes e tipos de mesa |
| `/admin/configuracoes` | Capacidade, horários, slots, permanência |
| `/admin/relatorios` | Relatório mensal com gráficos e CSV |

---

## API REST v1

Para o agente de WhatsApp. Documentação completa em `docs/API_WHATSAPP_AGENT.md`.

| Endpoint | Descricao |
|---|---|
| `GET /api/v1/disponibilidade?data=` | Capacidade geral da data |
| `GET /api/v1/slots?data=&pessoas=&horario=` | Slots disponíveis com sugestões alternativas |
| `GET /api/v1/reservas?telefone=&data=` | Busca reservas |
| `POST /api/v1/reservas` | Cria reserva |
| `GET/PATCH/DELETE /api/v1/reservas/:id` | Consulta, edita ou cancela reserva |

---

## Funcionalidades

### Painel da Porta (tablet)
- Lista reservas do dia com filtro por status
- Confirmar chegada com ajuste de número de pessoas
- Countdown regressivo após chegada (90 min normal, 120 min mesa unificada)
- Registrar entrada sem reserva
- Marcar no-show em lote
- Navegar entre datas

### Painel Admin
- Dashboard com resumo do dia
- Tabela de reservas com botão WhatsApp direto para o cliente
- Criar reserva manual
- Exportar CSV
- Relatório mensal com gráficos por canal, horários de pico e receita

### Ambientes e Mesas
- Cadastrar ambientes (ex: Salão Central, Pátio)
- Dentro de cada ambiente, definir tipos de mesa (ex: 4 mesas de 4, 5 mesas de 2, 1 mesa de 6)
- Ambientes ativos definem a capacidade simultânea do sistema

### Sistema de Slots (Rotatividade)
- Horário de funcionamento: 18h às 22h
- Slots a cada 30 min: 18:00, 18:30, 19:00, 19:30, 20:00, 20:30
- Permanência normal: 90 min por grupo
- Mesa unificada (grupos grandes): 120 min
- Bot verifica vagas por slot e sugere horários alternativos quando cheio

### Categorias de Ingressos
| Categoria | Faixa | Valor |
|---|---|---|
| Integral | 10+ anos | `valorPorPessoa` |
| Meia | 6-9 anos | R$39,95 fixo |
| Cortesia | até 5 anos | Grátis |

### Configurações ajustáveis
- Capacidade máxima e efetiva diária (padrão: 130)
- Permanência normal (padrão: 90 min)
- Permanência mesa unificada (padrão: 120 min)
- Horário de abertura e fechamento (padrão: 18h-22h)
- Intervalo entre slots (padrão: 30 min)
- Alerta de capacidade (padrão: 85%)

---

## Histórico de commits relevantes

| Commit | Descricao |
|---|---|
| `b18e6e0` | feat: ambientes com mesas, slots, countdown, WhatsApp admin, categorias de crianças |
| `1b88aa7` | fix: bloquear edicao e cancelamento de reservas nao-pendentes |
| `c8745ef` | fix: INSERT condicional atomico para concorrencia |
| `7d58e02` | feat: API REST v1 para agente de WhatsApp |
| `d2255f7` | feat: editar reserva, exportar CSV e no-show em lote |
