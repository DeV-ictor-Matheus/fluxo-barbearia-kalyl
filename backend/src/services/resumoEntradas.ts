import { prisma } from "../db.js";
import { rangeDoDiaBrasilia, hojeBrasilia } from "../lib/datasBrasilia.js";
import { montarResumo, type GrupoContagem } from "../core/resumo.js";

/**
 * Resumo do dia para o Dashboard "balcão": total de atendimentos e contagem
 * por barbeiro. NUNCA devolve valores em R$ — privacidade por design.
 *
 * Orquestra: busca no banco, traduz o formato do Prisma e delega a montagem
 * para a função pura `montarResumo` (testada isoladamente em core/).
 */
export async function resumoEntradas(dataISO?: string) {
  const dia = dataISO ?? hojeBrasilia();
  const { inicio, fimExclusivo } = rangeDoDiaBrasilia(dia);

  // Entrada é imutável e nasce no instante do fato, então criadoEm É a
  // competência — não há campo de data separado como no Saida (que é editável).
  const gruposPrisma = await prisma.entrada.groupBy({
    by: ["atendenteId"],
    where: { criadoEm: { gte: inicio, lt: fimExclusivo } },
    _count: { _all: true },
  });

  // Traduz o formato do Prisma (_count._all) para o shape limpo do domínio,
  // pra que o ORM não vaze para dentro da função pura.
  const grupos: GrupoContagem[] = gruposPrisma.map((g) => ({
    atendenteId: g.atendenteId,
    quantidade: g._count._all,
  }));

  // Barbeiros ativos = base do carrossel (aparecem mesmo com 0 hoje).
  const atendentes = await prisma.atendente.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  // Delega a regra de montagem (zero-fill, total, contrato) para o core.
  return montarResumo(grupos, atendentes, dia);
}
