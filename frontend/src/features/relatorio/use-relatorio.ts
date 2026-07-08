import { useQuery } from "@tanstack/react-query";
import { buscarRelatorio } from "./api";
import { relatorioKeys } from "./relatorio-keys";
import type { Periodo } from "@/types/relatorio";

/**
 * Hook de leitura do relatório financeiro (tela do dono).
 *
 * Herda a config global do QueryClient — igual ao useResumo, e pelo mesmo
 * motivo: staleTime 0 + refetchOnWindowFocus true mantém o dado financeiro
 * sempre fresco (dinheiro não pode ficar defasado); retry 1 dá uma nova
 * tentativa em falha de rede antes de mostrar erro. NÃO sobrescrever aqui.
 *
 * @param periodo Dia único ou intervalo escolhido no seletor.
 */
export function useRelatorio(periodo: Periodo) {
  return useQuery({
    queryKey: relatorioKeys.periodo(periodo),
    queryFn: () => buscarRelatorio(periodo),
  });
}
