# ADR-003 — Cache do PWA não toca dados financeiros

- **Status:** Aceito
- **Data:** 2026-07-15

## Contexto

O app virou um PWA instalável (`vite-plugin-pwa`, `registerType: 'prompt'`). Um
PWA carrega três capacidades que costumam vir no mesmo pacote: instalabilidade
(manifest + ícones), cache do app shell (o código do build), e cache de dados
(respostas de API guardadas no dispositivo via `runtimeCaching` do Workbox).

As duas primeiras são o objetivo. A terceira é a armadilha.

Um service worker com `runtimeCaching` apontando para a API interceptaria
`GET /entradas`, `GET /relatorio`, `GET /entradas/resumo` e persistiria o JSON
— valores em centavos, divisão por barbeiro, gorjetas — no **Cache Storage do
dispositivo, em texto puro**. Esse dado passaria a existir no aparelho fora do
alcance do RLS (ADR-001) e do `requireAuth` (ADR-002), que são toda a base de
segurança do projeto: dado financeiro só existe atrás de um JWT válido.

## Modelo de ameaça

O Cache Storage é legível por qualquer script rodando no mesmo origin, e
**sobrevive ao logout** — `Supabase.signOut()` limpa o token, não o cache do
Workbox. Um relatório cacheado continuaria no aparelho depois que a sessão
expirasse.

Pior é a ordem de resposta. Com Workbox em modo cache-first ou
stale-while-revalidate, o SW responde **da cache antes** de a rede retornar. Uma
sessão expirada, que deveria receber 401, receberia o relatório do mês passado
servido pelo próprio SW. É uma **falha de autorização silenciosa** — o backend
nega, mas o SW responde por baixo dele. A camada que o ADR-002 construiu para
garantir que leitura financeira passe pelo backend seria contornada no cliente.

"É o celular da barbearia, ninguém vai bisbilhotar o cache" é a mesma premissa
**física** que o ADR-002 já rejeitou. Não é controle de acesso. Um aparelho é
perdido, emprestado, roubado; um cache não pede senha. E o custo de nunca
cachear dado financeiro é praticamente zero — a barbearia tem Wi-Fi.

## Decisão

O service worker faz **precache apenas do app shell** — os arquivos do build
(`js`, `css`, `html`, ícones, fontes), cobertos por `globPatterns`. **Nenhum
`runtimeCaching`.** Nenhuma resposta de API entra no Cache Storage, em nenhuma
estratégia. O que se cacheia é código; o que se busca na rede é dado.

Em produção, frontend e backend ficam em **domínios separados**. O SW é
cross-origin em relação à API por construção — o navegador já não deixa o SW
interceptar outro origin sem configuração explícita, e não há nenhuma. A
`navigateFallbackDenylist` crava as rotas financeiras (`/api`, `/atendentes`,
`/servicos`, `/entradas`, `/relatorio`, `/saidas`) como **cinto e suspensório**:
caso um dia frontend e API dividam domínio atrás de um reverse proxy, a denylist
impede que uma navegação SPA caia no `index.html` por cima de uma chamada de
dado.

`registerType: 'prompt'` completa o desenho: o SW não recarrega sozinho. Baixa
a versão nova e espera o usuário aceitar via toast — um reload automático no
meio de um lançamento perderia o estado do formulário.

## Consequências

O app abre instantâneo, mesmo com rede ruim, porque o shell está pré-cacheado.
Mas **qualquer tela que precise de dado faz fetch pela rede**; sem conexão, cai
no `errorHandler` de UI (estado de erro/vazio). O app não funciona offline — e
isso é deliberado.

**Offline-first** (fila de lançamentos em IndexedDB, sincronização, idempotency
key no `POST /entradas`) fica registrado para **v2**. Ele exige exatamente o
tipo de persistência local que este ADR proíbe para dado financeiro, então não
é um ajuste de configuração — é um projeto próprio, com seu próprio modelo de
ameaça, a ser decidido quando (e se) a necessidade aparecer.

Trade-off aceito: **nunca cachear dado financeiro vale mais que abrir offline.**
