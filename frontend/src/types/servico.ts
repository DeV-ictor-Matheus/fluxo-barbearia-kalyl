// Tipo de domínio do Serviço — espelha o model Prisma `Servico`.
// Fonte de verdade: backend/prisma/schema.prisma (model Servico).
// A relação `entradas[]` não entra: o GET /servicos usa findMany() sem
// include, então a resposta traz apenas os campos escalares.

export interface Servico {
  id: string;
  nome: string;
  precoCasaCentavos: number;
  precoParceiro2Centavos: number;
}
