import type { Periodo } from "@/types/relatorio";

// Factory de query keys do domínio "relatorio".
// Centraliza a construção das chaves para que leitura (useQuery) e
// invalidação usem exatamente a mesma estrutura — sem string mágica.
//
// A key carrega o período: relatórios de dias/intervalos diferentes são
// caches DISTINTOS. Sem isso, o React Query serviria o relatório de um
// período quando outro fosse pedido (deep-compare de key resolve a
// igualdade estrutural do objeto Periodo).
//
// Hierarquia: ['relatorio'] → ['relatorio', periodo]
export const relatorioKeys = {
  /** Raiz do domínio. Invalida todas as queries de relatório. */
  all: ["relatorio"] as const,

  /**
   * Relatório de um período específico. É função (não propriedade estática)
   * para carregar o Periodo escolhido — mesmo padrão de entradasKeys.hoje().
   */
  periodo: (periodo: Periodo) => [...relatorioKeys.all, periodo] as const,
};
