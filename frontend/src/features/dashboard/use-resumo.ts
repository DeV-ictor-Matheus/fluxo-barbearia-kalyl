import { useQuery } from "@tanstack/react-query";
import { buscarResumo } from "./api";
import { dashboardKeys } from "./dashboard-keys";

/**
 * Hook de leitura do resumo do dia (Dashboard balcão).
 *
 * Herda da config global do QueryClient:
 *  - staleTime: 0 + refetchOnWindowFocus: true → ao voltar da Tela E (que fica
 *    aberta em lançamentos sequenciais), o painel revalida sozinho. É exatamente
 *    o comportamento que o balcão precisa; NÃO sobrescrever staleTime aqui.
 *  - retry: 1 → uma nova tentativa em falha de rede antes de mostrar erro.
 *
 * @param data Dia opcional. Omitido → "hoje" (chave estável dashboardKeys.resumo()).
 */
export function useResumo(data?: string) {
  return useQuery({
    queryKey: dashboardKeys.resumo(data),
    queryFn: () => buscarResumo(data),
  });
}
