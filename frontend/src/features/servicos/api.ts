// Camada de transporte do domínio "servicos".
// Responsabilidade única: o QUE buscar e COMO. Não conhece React.
// Espelha features/atendentes/api.ts.

import { api } from "@/lib/api-client";
import type { Servico } from "@/types/servico";

/** Lista todos os serviços disponíveis (GET /servicos). */
export async function buscarServicos(): Promise<Servico[]> {
  return api.get<Servico[]>("/servicos");
}
