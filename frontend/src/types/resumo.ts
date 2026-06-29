// Contrato de domínio do resumo do dia (Dashboard "balcão").
// Fonte de verdade: backend/src/core/resumo.ts (interface Resumo).
// Espelha exatamente o retorno de montarResumo — NUNCA expõe valores em R$.
// Privacidade por design vive no contrato, não no CSS.

export interface BarbeiroResumo {
  atendenteId: string;
  nome: string;
  quantidade: number;
}

export interface Resumo {
  /** Dia do resumo no formato YYYY-MM-DD (competência Brasília). */
  data: string;
  /** Soma das contagens dos barbeiros ativos. */
  totalAtendimentos: number;
  /** Barbeiros ativos com zero-fill — base estável do carrossel. */
  porBarbeiro: BarbeiroResumo[];
}
