// Diferente de servicos/atendentes (key inline), aqui a factory se justifica:
// a Tela E (criar entrada) invalida o resumo no onSuccess. Leitura e
// invalidação precisam usar a MESMA estrutura de chave — string mágica
// duplicada dessincroniza em silêncio.
//
// Hierarquia: ['dashboard'] → ['dashboard', 'resumo', data?]
// invalidateQueries({ queryKey: dashboardKeys.all }) derruba tudo do domínio.

export const dashboardKeys = {
  /** Raiz do domínio. Invalida todas as queries do dashboard. */
  all: ["dashboard"] as const,

  /**
   * Resumo do dia. `data` undefined = dia corrente (chave estável para "hoje").
   * A Tela E invalida via dashboardKeys.resumo() após criar uma entrada.
   */
  resumo: (data?: string) => [...dashboardKeys.all, "resumo", data] as const,
};
