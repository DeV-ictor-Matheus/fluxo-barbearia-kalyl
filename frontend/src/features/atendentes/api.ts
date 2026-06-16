import { api } from "@/lib/api-client";
import type { Atendente } from "@/types/atendente";

// Busca todos os atendentes. O api-client cuida do fetch, do proxy /api
// e de lançar ApiError em caso de falha.
export function buscarAtendentes() {
  return api.get<Atendente[]>("/atendentes");
}
