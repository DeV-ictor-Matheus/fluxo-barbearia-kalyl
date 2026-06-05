import { prisma } from "../db.js";

/**
 * Lista todas as Saídas, da mais recente para a mais antiga
 * por DATA de competência (não por criadoEm).
 * Sem filtros no servidor — o front filtra/agrupa conforme precisar.
 */
export async function listarSaidas() {
  const saidas = await prisma.saida.findMany({
    orderBy: { data: "desc" },
  });

  return saidas;
}
