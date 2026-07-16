// Tipos do domínio "saídas" — espelhados manualmente do backend.
// Fonte de verdade: backend/src/schemas/saidaSchema.ts (criarSaidaSchema)
// e schema.prisma (CategoriaSaida). Dívida consciente registrada no
// backlog v2 (tipos compartilhados back↔front).

// A lista precisa bater EXATAMENTE com o enum CategoriaSaida do Prisma
// e com CATEGORIAS do saidaSchema.ts. Ordem = ordem de exibição na Tela.
export type CategoriaSaida =
  | "ALUGUEL"
  | "TAXA_CARTAO"
  | "PRODUTOS"
  | "ALUGUEL_POS"
  | "SALARIO"
  | "CONTAS"
  | "MARKETING"
  | "OUTROS";

// Saída como o backend a devolve (POST /saidas → 201).
// Espelha o registro persistido: schema + campos gerados pelo banco.
// data e criadoEm chegam como string ISO no envelope JSON.
export interface Saida {
  id: string;
  categoria: CategoriaSaida;
  valorCentavos: number;
  descricao: string | null;
  recorrente: boolean;
  data: string; // competência — ISO
  criadoEm: string; // auditoria imutável — ISO
}
