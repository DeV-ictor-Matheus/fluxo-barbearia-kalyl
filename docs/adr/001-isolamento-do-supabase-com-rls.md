# ADR-0001 — Isolamento do Supabase com RLS

- **Status:** Aceito
- **Data:** 2026-07-13

## Contexto

O banco é um Postgres hospedado no Supabase. O Supabase expõe todas as tabelas
do schema `public` através do PostgREST, acessível com a chave anônima — que é
pública por definição e vive no bundle do frontend.

Ao verificar o estado das tabelas via SQL Editor, descobriu-se que `relrowsecurity`
era `false` em todas elas. Na prática: qualquer pessoa com a chave anônima poderia
ler e escrever direto em `Atendente`, `Entrada`, `Servico` e `Saida`, contornando
completamente o backend Express — e, com ele, toda a validação Zod e as regras de
negócio da `calcularDivisao`.

## Decisão

**O frontend nunca fala com o Supabase para dados.** Toda leitura e escrita passa
pelo backend Express, que acessa o Postgres via Prisma com conexão direta.

Consequentemente, o PostgREST não precisa funcionar para tabela nenhuma:

```sql
ALTER TABLE "Atendente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Atendente" FORCE ROW LEVEL SECURITY;
-- idem para Entrada, Servico, Saida, _prisma_migrations
```

RLS habilitado **com FORCE** e **sem nenhuma policy**. Zero policies significa
zero linhas visíveis: a porta do PostgREST fica trancada, não entreaberta.

O backend usa a role `postgres`, que bypassa RLS por privilégio — o Prisma
continua operando normalmente, inclusive nas migrations.

O Supabase segue sendo usado para **Auth** (ver ADR-0002), apenas não como
camada de dados.

## Alternativas descartadas

**Escrever policies permissivas.** Seria modelar autorização duas vezes — uma no
Postgres, outra no Express — com o risco permanente de as duas divergirem. Só
faria sentido se o frontend realmente falasse com o Supabase, o que não é o caso.

**Deixar RLS desligado e confiar na obscuridade da chave anônima.** A chave está
no bundle. Não é segredo.

## Nota sobre `_prisma_migrations`

Essa tabela é bookkeeping do Prisma (histórico de migrations aplicadas), não tem
dado de negócio. O linter do Supabase a marcava como CRITICAL pelo mesmo motivo
das demais: exposta via PostgREST sem RLS. O vazamento real seria apenas nomes de
migrations — reconhecimento de schema, não dado sensível — mas trancá-la é
gratuito e elimina o alerta.

O `ALTER TABLE` dela foi aplicado **manualmente pelo SQL Editor**, não como
migration Prisma. Uma migration que altera a própria tabela de controle de
migrations é um acoplamento circular desnecessário.

## Consequências

- O frontend depende inteiramente do backend estar de pé. Aceito: é um app interno.
- Se um dia o frontend precisar falar com o Supabase direto (ex.: Realtime), este
  ADR precisa ser revisitado e policies terão de ser escritas.
- O alerta CRITICAL do painel Supabase está resolvido.
