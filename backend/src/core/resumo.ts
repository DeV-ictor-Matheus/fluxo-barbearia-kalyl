// Lógica pura de montagem do resumo do dia para o Dashboard "balcão".
// Recebe dados JÁ buscados (sem tocar no banco) e devolve a contagem por
// barbeiro + total. NUNCA expõe valores em R$ — privacidade por design.
// Mora em core/ pela mesma razão de divisao.ts: regra de domínio, zero I/O.

export interface GrupoContagem {
  atendenteId: string;
  quantidade: number;
}

export interface AtendenteResumo {
  id: string;
  nome: string;
}

export interface BarbeiroResumo {
  atendenteId: string;
  nome: string;
  quantidade: number;
}

export interface Resumo {
  data: string;
  totalAtendimentos: number;
  porBarbeiro: BarbeiroResumo[];
}

export function montarResumo(
  grupos: GrupoContagem[],
  atendentes: AtendenteResumo[],
  dia: string,
): Resumo {
  // Mapa atendenteId -> quantidade, pra lookup O(1).
  const contagemPorId = new Map(
    grupos.map((g) => [g.atendenteId, g.quantidade]),
  );

  // Base = barbeiros ativos. Preenche 0 pra quem não atendeu (continua no carrossel).
  const porBarbeiro = atendentes.map((a) => ({
    atendenteId: a.id,
    nome: a.nome,
    quantidade: contagemPorId.get(a.id) ?? 0,
  }));

  // Total = soma das contagens dos barbeiros ATIVOS (inativo não entra).
  const totalAtendimentos = porBarbeiro.reduce(
    (soma, b) => soma + b.quantidade,
    0,
  );

  return { data: dia, totalAtendimentos, porBarbeiro };
}
