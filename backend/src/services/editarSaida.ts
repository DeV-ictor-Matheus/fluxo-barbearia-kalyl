import { prisma } from "../db.js";
import { EditarSaidaInput } from "../schemas/saidaSchema.js";

/**
 * Edita uma Saída existente (correção de lançamento manual).
 * Recebe apenas os campos a alterar; o Prisma atualiza só o que veio.
 * Campos imutáveis (id, criadoEm) nunca chegam aqui — barrados pelo schema.
 */
export async function editarSaida(id: string, dados: EditarSaidaInput) {
  const saida = await prisma.saida.update({
    where: { id },
    data: dados, // só os campos presentes em "dados" são atualizados
  });

  return saida;
}
