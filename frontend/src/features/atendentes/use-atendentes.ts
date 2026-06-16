import { useQuery } from "@tanstack/react-query";
import { buscarAtendentes } from "./api";

// Hook de leitura dos atendentes. A queryKey identifica esta query no
// cache; quando precisarmos invalidá-la (ex: após cadastrar atendente),
// usamos esta mesma chave.
export function useAtendentes() {
  return useQuery({
    queryKey: ["atendentes"],
    queryFn: buscarAtendentes,
  });
}
