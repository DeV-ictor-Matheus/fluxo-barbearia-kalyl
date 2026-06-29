// Responsabilidade única: o QUE buscar e COMO. Não conhece React.
// Espelha features/servicos/api.ts e features/atendentes/api.ts.

import { api } from "@/lib/api-client";
import type { Resumo } from "@/types/resumo";

// O backend envelopa a resposta em { resumo }, coerente com { entradas }
// do GET /entradas. Desembrulhamos aqui para que o hook receba o Resumo limpo.
interface ResumoResponse {
  resumo: Resumo;
}

/**
 * Busca o resumo do dia (GET /entradas/resumo).
 * @param data Dia opcional YYYY-MM-DD. Omitido → backend usa hojeBrasilia().
 */
export async function buscarResumo(data?: string): Promise<Resumo> {
  const query = data ? `?data=${data}` : "";
  const { resumo } = await api.get<ResumoResponse>(`/entradas/resumo${query}`);
  return resumo;
}
