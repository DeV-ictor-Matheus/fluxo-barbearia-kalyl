import { useQuery } from "@tanstack/react-query";
import { buscarEntradasHoje } from "./api";
import { entradasKeys } from "./entradas-keys";

/**
 * Hook de leitura da lista de entradas de hoje (Tela G).
 * Mesma família de cache que a Tela E invalida no onSuccess
 * (entradasKeys.hoje()) — lançar uma entrada revalida esta lista.
 *
 * Herda staleTime/retry do QueryClient global (mesma razão do use-resumo):
 * não sobrescrever aqui mantém o comportamento de balcão consistente.
 */
export function useEntradasHoje() {
  return useQuery({
    queryKey: entradasKeys.hoje(),
    queryFn: buscarEntradasHoje,
  });
}
