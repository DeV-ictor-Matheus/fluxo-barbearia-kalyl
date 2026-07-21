// Camada de transporte do domínio "saídas".
// Responsabilidade única: o QUE mandar ao servidor e COMO. Não conhece React.
// Espelha o papel de features/entradas/api.ts.

import { api } from "@/lib/api-client";
import type { CategoriaSaida, Saida } from "@/types/saida";

// CriarSaidaInput — espelhado manualmente do backend.
// Fonte de verdade: backend/src/schemas/saidaSchema.ts (criarSaidaSchema).
//
// Campos com `?` espelham os `.optional()` do Zod: o backend os assume
// quando ausentes.
//
// recorrente NÃO está aqui. O campo existe no schema Prisma e no Zod do
// backend com .default(false); simplesmente não é exposto no v1 — rótulo
// booleano sem automação não entrega valor ao dono. Volta quando houver
// recorrência de verdade. Zero migration para removê-lo daqui.
//
// data vai como string ISO ("2026-07-15"); o backend usa z.coerce.date()
// e coage para Date. valorCentavos é inteiro (centavos), nunca reais.
export interface CriarSaidaInput {
  categoria: CategoriaSaida;
  valorCentavos: number;
  data: string;
  descricao?: string;
}

/**
 * Cria uma Saída (POST). Write financeiro editável (diferente da Entrada,
 * a Saída pode ser corrigida depois via PATCH). O backend valida com
 * criarSaidaSchema.parse() e devolve o registro persistido.
 */
export async function criarSaida(input: CriarSaidaInput): Promise<Saida> {
  return api.post<Saida>("/saidas", input);
}
