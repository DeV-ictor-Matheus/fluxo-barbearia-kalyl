import { prisma } from "../db.js";
import { rangeDoDiaBrasilia, hojeBrasilia } from "../lib/datasBrasilia.js";

/**
 * Resumo do dia para o Dashboard "balcão": total de atendimentos e contagem
 * por barbeiro. NUNCA devolve valores em R$ — privacidade por design.
 */
export async function resumoEntradas(dataISO?: string) {
  const dia = dataISO ?? hojeBrasilia();
  const { inicio, fim } = rangeDoDiaBrasilia(dia);

  // 1. Conta no BANCO, agrupando por atendente (GROUP BY, não conta na aplicação).
  const grupos = await prisma.entrada.groupBy({
    by: ["atendenteId"],
    where: { criadoEm: { gte: inicio, lte: fim } },
    _count: { _all: true },
  });

  // Mapa atendenteId -> quantidade, pra consulta rápida no passo 3.
  const contagemPorId = new Map(
    grupos.map((g) => [g.atendenteId, g._count._all]),
  );

  // 2. Busca os barbeiros ativos (são a base do carrossel, mesmo com 0 hoje).
  const atendentes = await prisma.atendente.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  // 3. Monta a contagem por barbeiro, preenchendo 0 pra quem não atendeu.
  const porBarbeiro = atendentes.map((a) => ({
    atendenteId: a.id,
    nome: a.nome,
    quantidade: contagemPorId.get(a.id) ?? 0,
  }));

  // 4. Total do dia = soma das contagens (já em memória, trivial).
  const totalAtendimentos = porBarbeiro.reduce(
    (soma, b) => soma + b.quantidade,
    0,
  );

  return {
    data: dia,
    totalAtendimentos,
    porBarbeiro,
  };
}
