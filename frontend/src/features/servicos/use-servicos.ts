import { useQuery } from "@tanstack/react-query";
import { buscarServicos } from "./api";

// Hook de leitura dos serviços. A queryKey identifica esta query no cache.
// Inline (sem factory) como em useAtendentes: a lista de serviços não é
// invalidada pelo fluxo de entradas, então não há ganho em chave hierárquica.
export function useServicos() {
  return useQuery({
    queryKey: ["servicos"],
    queryFn: buscarServicos,
  });
}
