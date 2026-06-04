import { prisma } from "../db";
import { CriarSaidaInput } from "../schemas/saidaSchema";

/**
 * Registra uma Saída (despesa da barbearia).
 * Diferente de registrarEntrada: NÃO há cálculo de divisão.
 * Saída é custo exclusivo da casa — não toca calcularDivisao.
 */
export async function registrarSaida(dados: CriarSaidaInput) {
  const saida = await prisma.saida.create({
    data: {
      descricao: dados.descricao,
      valorCentavos: dados.valorCentavos,
      categoria: dados.categoria,
      recorrente: dados.recorrente,
      data: dados.data,
      // criadoEm é preenchido sozinho pelo @default(now()) — não passamos.
    },
  });

  return saida;
}
