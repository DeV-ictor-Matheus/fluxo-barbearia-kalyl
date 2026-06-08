import { prisma } from "../db.js";
import { calcularDivisao, type Papel } from "../core/divisao.js";
import { CriarEntradaInput } from "../schemas/entradaSchema.js";

// Papéis válidos do domínio. Valida em runtime o que vem do banco, porque
// Atendente.papel é String no schema mas calcularDivisao exige o tipo Papel.
const PAPEIS_VALIDOS: readonly Papel[] = ["dono", "parceiro1", "parceiro2"];

function ehPapelValido(valor: string): valor is Papel {
  return (PAPEIS_VALIDOS as readonly string[]).includes(valor);
}

export async function registrarEntrada(dados: CriarEntradaInput) {
  // 1. BUSCAR O ATENDENTE: é a fonte da verdade do papel (não confiamos no cliente).
  const atendente = await prisma.atendente.findUnique({
    where: { id: dados.atendenteId },
  });

  if (!atendente) {
    throw new Error("Atendente não encontrado.");
  }

  // Ponte segura String -> Papel: se o banco tiver papel inesperado, falha alto.
  if (!ehPapelValido(atendente.papel)) {
    throw new Error(
      `Papel inválido no cadastro do atendente: "${atendente.papel}".`,
    );
  }
  const papel: Papel = atendente.papel;

  // 2. BUSCAR O SERVIÇO: pega o preço atual pra congelar na entrada.
  const servico = await prisma.servico.findUnique({
    where: { id: dados.servicoId },
  });

  if (!servico) {
    throw new Error("Serviço não encontrado.");
  }

  // qual preço usar depende da tabela aplicada (casa ou parceiro2)
  const tabelaAplicada = papel === "parceiro2" ? "parceiro2" : "casa";
  const valorServicoCentavos =
    tabelaAplicada === "parceiro2"
      ? servico.precoParceiro2Centavos
      : servico.precoCasaCentavos;

  // 3. TETO DO DESCONTO (50% do preço). Regra de domínio: depende do preço,
  // por isso não cabe no Zod. Math.floor mantém o teto em centavos inteiros.
  const tetoDesconto = Math.floor(valorServicoCentavos / 2);
  if (dados.descontoCentavos > tetoDesconto) {
    throw new Error(
      `Desconto acima do permitido: máximo ${tetoDesconto} centavos (50% do serviço).`,
    );
  }

  // 4. CALCULAR: usa a lógica pura já testada.
  const divisao = calcularDivisao({
    papel,
    clienteProprio: dados.clienteProprio,
    valorServicoCentavos,
    descontoCentavos: dados.descontoCentavos,
    gorjetaCentavos: dados.gorjetaCentavos,
  });

  // 5. GRAVAR: salva a entrada com os valores CONGELADOS.
  const entrada = await prisma.entrada.create({
    data: {
      atendenteId: dados.atendenteId,
      servicoId: dados.servicoId,
      tabelaAplicada,
      clienteProprio: dados.clienteProprio,
      valorServicoCentavos,
      descontoCentavos: dados.descontoCentavos,
      gorjetaCentavos: dados.gorjetaCentavos,
      valorBarbeariaCentavos: divisao.valorBarbeariaCentavos,
      valorAtendenteCentavos: divisao.valorAtendenteCentavos,
      metodoPagamento: dados.metodoPagamento,
    },
  });

  return entrada;
}
