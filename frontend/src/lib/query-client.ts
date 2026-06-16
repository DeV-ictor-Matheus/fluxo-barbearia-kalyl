import { QueryClient } from "@tanstack/react-query";

/**
 * Instância única do React Query para todo o app.
 *
 * Config alinhada às regras do domínio:
 * - staleTime 0: todo dado é revalidado na rede a cada uso (leitura sempre
 *   vai à rede). O cache em memória ainda evita tela vazia, mas a busca
 *   real dispara sempre — protege a regra de não servir dado financeiro velho.
 * - refetchOnWindowFocus: a Dashboard se atualiza ao reganhar foco, já que
 *   a tela de lançamento fica aberta durante entradas sequenciais.
 * - retry de query = 1: uma segunda chance em falha de rede.
 * - retry de mutation = 0: NUNCA reenviar automaticamente uma escrita
 *   financeira (evita duplicar uma entrada que pode ter passado).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
