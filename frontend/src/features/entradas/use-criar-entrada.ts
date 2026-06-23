// frontend/src/features/entradas/use-criar-entrada.ts
//
// Hook do write financeiro da Tela E (Nova Entrada).
// Cria uma Entrada imutável e revalida as telas que dependem dela.
//
// É NEUTRO de propósito: não limpa formulário, não devolve foco, não mostra
// toast. Isso é responsabilidade do componente, que reage a isPending /
// isError / isSuccess. O hook é o efeito colateral; o componente, a UX.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarEntrada, type CriarEntradaInput } from "./api";
import { entradasKeys } from "./entradas-keys";
import type { Entrada } from "../../types/entrada.ts";
import type { ApiError } from "../../lib/api-error";

export function useCriarEntrada() {
  const queryClient = useQueryClient();

  return useMutation<Entrada, ApiError, CriarEntradaInput>({
    mutationFn: criarEntrada,

    // SEM update otimista (ADR-001): o valor da divisão nasce no backend
    // (calcularDivisao + papel derivado). O cliente não conhece o resultado
    // no momento do clique, então otimismo exibiria um número possivelmente
    // errado num registro que não pode ser corrigido depois.

    onSuccess: () => {
      // Criar uma entrada invalida duas leituras: a lista do dia (Tela G)
      // e o resumo do Dashboard (Tela F). Ambas refazem o fetch do servidor
      // — a fonte da verdade — em vez de adivinhar o novo estado no cliente.
      queryClient.invalidateQueries({ queryKey: entradasKeys.hoje() });

      // TODO: migrar para dashboardKeys.resumo() quando a Tela F nascer.
      // Inline por ora porque a feature `dashboard` ainda não existe.
      queryClient.invalidateQueries({ queryKey: ["dashboard", "resumo"] });
    },

    // retry herdado da config global (retry: 0 para mutations).
    // CRÍTICO: não habilitar retry aqui. Re-tentar um POST não-idempotente
    // duplicaria uma Entrada imutável — corrupção sem desfazer.
  });
}
