// Hook do write financeiro da Tela de Saída (Nova Saída).
// Cria uma Saída e revalida o relatório financeiro.
//
// É NEUTRO de propósito: não limpa formulário, não devolve foco, não mostra
// toast. Isso é responsabilidade do componente, que reage a isPending /
// isError / isSuccess. O hook é o efeito colateral; o componente, a UX.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarSaida, type CriarSaidaInput } from "./api";
import { relatorioKeys } from "@/features/relatorio/relatorio-keys";
import type { Saida } from "@/types/saida";
import type { ApiError } from "@/lib/api-error";

export function useCriarSaida() {
  const queryClient = useQueryClient();

  return useMutation<Saida, ApiError, CriarSaidaInput>({
    mutationFn: criarSaida,

    // SEM update otimista. A Saída entra no Líquido da casa via cálculo do
    // backend (receita − despesas); o cliente não conhece o novo líquido no
    // momento do clique. Otimismo exibiria um número possivelmente errado.

    onSuccess: () => {
      // Uma Saída nova pode cair em QUALQUER período que o dono esteja
      // olhando no Relatório. Invalidamos a RAIZ do domínio (relatorioKeys.all),
      // não um período específico — derruba todas as leituras de relatório
      // e cada uma refaz o fetch do servidor (fonte da verdade do Líquido).
      queryClient.invalidateQueries({ queryKey: relatorioKeys.all });
    },

    // retry herdado da config global (retry: 0 para mutations).
    // CRÍTICO: não habilitar retry aqui. Re-tentar um POST não-idempotente
    // duplicaria a Saída. (A Saída é editável via PATCH, mas duplicata é
    // ruído no relatório — melhor falhar e o operador relançar consciente.)
  });
}
