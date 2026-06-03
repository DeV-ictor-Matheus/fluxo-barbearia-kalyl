import { prisma } from "../db.js";
import { calcularDivisao, type Papel } from "../core/divisao.js";

interface DadosNovaEntrada {
  atendenteId: string;
  servicoId: string;
  papel: Papel;
  clienteProprio: boolean;
  descontoCentavos: number;
  gorjetaCentavos: number;
  metodoPagamento: string;
}

export async function registrarEntrada(dados: DadosNovaEntrada) {
  // 1. BUSCAR: pega o serviço no banco pra saber o preço atual
  const servico = await prisma.servico.findUnique({
    where: { id: dados.servicoId },
  });

  if (!servico) {
    throw new Error("Serviço não encontrado.");
  }

  // qual preço usar depende da tabela aplicada (casa ou parceiro2)
  const tabelaAplicada = dados.papel === "parceiro2" ? "parceiro2" : "casa";
  const valorServicoCentavos =
    tabelaAplicada === "parceiro2"
      ? servico.precoParceiro2Centavos
      : servico.precoCasaCentavos;

  // 2. CALCULAR: usa a lógica pura já testada
  const divisao = calcularDivisao({
    papel: dados.papel,
    clienteProprio: dados.clienteProprio,
    valorServicoCentavos,
    descontoCentavos: dados.descontoCentavos,
    gorjetaCentavos: dados.gorjetaCentavos,
  });

  // 3. GRAVAR: salva a entrada com os valores CONGELADOS
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
