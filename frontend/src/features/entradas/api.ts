// Camada de transporte do domínio "entradas".
// Responsabilidade única: o QUE mandar ao servidor e COMO. Não conhece React.
// Espelha o papel de features/atendentes/api.ts.

import { api } from "../../lib/api-client";
import type { Entrada, MetodoPagamento } from "../../types/entrada.ts";

// CriarEntradaInput — espelhado manualmente do backend.
// Fonte de verdade: backend/src/schemas/entradaSchema.ts (criarEntradaSchema).
// Dívida consciente registrada no backlog v2 (tipos compartilhados back↔front).
//
// Campos com `?` espelham os `.default()` do Zod: o backend os assume quando
// ausentes. A Tela E sempre os envia explícitos, mas o CONTRATO os aceita
// omitidos — então o tipo reflete o contrato, não o uso.
export interface CriarEntradaInput {
  atendenteId: string;
  servicoId: string;
  metodoPagamento: MetodoPagamento;
  clienteProprio?: boolean;
  descontoCentavos?: number;
  gorjetaCentavos?: number;
}

/**
 * Cria uma Entrada (POST). Write financeiro: a Entrada nasce imutável.
 * O cliente NÃO envia preço nem papel — o backend deriva o papel via
 * atendenteId e congela o preço do serviço no momento da criação.
 */
export async function criarEntrada(input: CriarEntradaInput): Promise<Entrada> {
  return api.post<Entrada>("/entradas", input);
}
