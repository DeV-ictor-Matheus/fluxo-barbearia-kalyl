// Factory de query keys do domínio "entradas".
// Centraliza a construção das chaves do React Query para que leitura
// (useQuery) e invalidação (invalidateQueries) usem exatamente a mesma
// estrutura — sem string mágica duplicada que dessincroniza em silêncio.
//
// Hierarquia: ['entradas'] → ['entradas', 'hoje']
// `invalidateQueries({ queryKey: entradasKeys.all })` derruba tudo do domínio;
// `entradasKeys.hoje()` derruba só a lista do dia.

export const entradasKeys = {
  /** Raiz do domínio. Invalida todas as queries de entradas. */
  all: ["entradas"] as const,

  /**
   * Lista de entradas do dia (Tela G lê, Tela E invalida no onSuccess).
   * É função, não propriedade estática, para aceitar filtros no futuro
   * (ex.: hoje({ atendenteId })) sem refatorar os call-sites existentes.
   */
  hoje: () => [...entradasKeys.all, "hoje"] as const,
} as const;
