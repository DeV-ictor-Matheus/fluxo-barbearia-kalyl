import { prisma } from "../db.js";
import { rangeDoDiaBrasilia, hojeBrasilia } from "../lib/datasBrasilia.js";

/**
 * Lista as entradas de um dia (default: hoje em Brasília), da mais recente
 * para a mais antiga, já com nome do atendente e do serviço (evita N+1 no front).
 */
export async function listarEntradas(dataISO?: string) {
  const dia = dataISO ?? hojeBrasilia();
  const { inicio, fim } = rangeDoDiaBrasilia(dia);

  const entradas = await prisma.entrada.findMany({
    where: {
      criadoEm: { gte: inicio, lte: fim },
    },
    orderBy: { criadoEm: "desc" },
    include: {
      atendente: { select: { id: true, nome: true, papel: true } },
      servico: { select: { id: true, nome: true } },
    },
  });

  return entradas;
}
