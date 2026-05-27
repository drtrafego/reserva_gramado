# scripts

Scripts versionáveis de seed e manutenção operacional do banco. Diferentes do diretório `scripts/` legado em `.mjs`, estes scripts em TypeScript dependem do helper `src/lib/db/seed-helpers.ts` e usam o Drizzle do projeto.

## Seed de ambientes por restaurante

Cada restaurante tem seu próprio script (`seed-ambientes-<nome>.ts`) com os dados extraídos da planta baixa. O helper `seedAmbientes` cuida da escrita no banco.

### Como rodar

Pré requisito: `DATABASE_URL` configurada no `.env` apontando para o banco alvo.

A partir da raiz do projeto:

```bash
pnpm seed:ambientes:plazza
```

Modos disponíveis (passe via flag `--mode=`):

- `skip` (padrão): se já existe ambiente com mesmo nome (case insensitive), pula.
- `replace`: deleta o ambiente existente (cascade derruba os `tipos_mesa`) e recria com os dados novos.
- `append`: insere sempre, mesmo se houver duplicidade de nome.

Exemplo sobrescrevendo:

```bash
pnpm tsx scripts/seed-ambientes-gramado-plazza.ts --mode=replace
```

### Replicar para novo restaurante

1. Copiar `seed-ambientes-gramado-plazza.ts` renomeando para o novo restaurante.
2. Editar o array `dados` com os ambientes e tipos de mesa da planta.
3. Opcional: adicionar o novo script ao `package.json` em `scripts`.

## Regra de segurança

Estes scripts NUNCA tocam na tabela `reservas`. Operam apenas em `ambientes`, `tipos_mesa` e (futuramente) `restaurante_config`. Reservas em produção não são afetadas.
