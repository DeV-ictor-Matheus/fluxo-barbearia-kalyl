# ADR-0002 — Modelo de autenticação: conta única de balcão

- **Status:** Aceito
- **Data:** 2026-07-13

## Contexto

Até este ponto, apenas `GET /relatorio` exigia autenticação. Todas as demais rotas
— incluindo `POST /entradas`, `POST /saidas`, `PATCH /saidas/:id`,
`POST /atendentes` e `POST /servicos` — aceitavam requisições anônimas.

A premissa que sustentava isso era: _"só a equipe da barbearia usa o celular do
balcão"_. Isso é verdade, e é irrelevante.

## Modelo de ameaça

A URL da API é descobrível — está no bundle do frontend e aparece na aba Network
em dois cliques. Uma requisição direta ao endpoint **não passa pelo frontend**:

- `POST /entradas` anônimo injeta receita falsa no financeiro do cliente.
- `POST /atendentes` anônimo é pior: o handler joga `req.body` cru no Prisma, sem
  schema Zod. Um atendente com `papel: "dono"` corrompe a base da `calcularDivisao`
  — não um registro, a **regra de cálculo**.

"Só a equipe usa o celular" é uma premissa **física**, não um controle de acesso.
Pelo mesmo motivo, um botão de logout não fecharia essa porta: logout limpa o token
do navegador do usuário, e o atacante nunca esteve no navegador.

O barbeiro mal-intencionado, por outro lado, **não** é a ameaça aqui. Se ele
quisesse fraudar, usaria a UI — e autenticação não impede isso. O que impediria é
auditoria de autoria, que é outro problema (ver Débito de v2).

## Decisão

`requireAuth` (JWT do Supabase, validado por JWKS/ES256) em **todas** as rotas,
exceto o healthcheck `GET /` — que precisa responder sem credencial para
monitoramento e não expõe dado algum.

No frontend, `ProtectedRoute` envolve `/` além de `/relatorio`: o app inteiro fica
atrás de login. A sessão do Supabase persiste no `localStorage` e o token renova
sozinho via `getSession()`, então o login acontece **uma vez na instalação** —
sem fricção diária no balcão.

**Uma única conta**, compartilhada pela equipe. Token válido = alguém da equipe,
sem distinção de papel.

## Trade-off aceito

Com conta única, qualquer membro logado consegue abrir `/relatorio` se souber a
rota. A exclusividade do relatório ao dono, que era protegida apenas por
obscuridade, deixa de existir.

Aceito pelo cliente: equipe de três pessoas, confiança interna estabelecida. A
ameaça que este ADR fecha é **escrita anônima vinda da internet**, não leitura
interna do financeiro.

## Alternativas descartadas

**API key estática no header, embutida no build.** Estaria no bundle. É público.
Não é credencial.

**Manter as rotas de escrita públicas.** Só seria defensável se a URL da API não
fosse descobrível. Ela é.

**Dois níveis de conta agora.** Correto, mas exige um segundo eixo de autorização
no backend e muda o fluxo de UI. Adiado — ver abaixo.

## Débito de v2 — dois níveis de acesso

Substituir a conta única por:

- conta **balcão**: escrita apenas (entradas, saídas);
- conta **dono**: escrita + leitura de `/relatorio`.

Enforcement no **backend**, não escondendo no frontend. Duas vias possíveis:
claim no JWT (`app_metadata.role` no Supabase) ou lookup do `papel` a partir do
`atendenteId` — que já é derivado server-side hoje.

Isso casa naturalmente com o outro débito pendente: campo `criadoPor` na `Entrada`
(auditoria de autoria), que só faz sentido com login individual por barbeiro.

## Fora de escopo

`POST /atendentes` continua sem schema Zod, inconsistente com `POST /servicos`.
O `requireAuth` fecha o vetor **externo**, mas a validação segue sendo dívida
técnica e merece fatia própria.

## Consequências

- Toda requisição ao backend exige `Authorization: Bearer <jwt>`. O `api-client.ts`
  do frontend já injeta o token fresco automaticamente.
- Comentários e copy que assumiam _"login = dono"_ foram atualizados: a premissa
  morreu com esta decisão.
- Cobertura de teste do `requireAuth` em `src/middlewares/__tests__/requireAuth.test.ts`.
