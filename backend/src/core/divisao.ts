export type Papel = "dono" | "parceiro1" | "parceiro2";

// O que a função recebe pra calcular a divisão
export interface DadosDivisao {
  papel: Papel;
  clienteProprio: boolean; // só relevante pro parceiro2
  valorServicoCentavos: number;
  descontoCentavos: number;
  gorjetaCentavos: number;
}

// O que a função devolve
export interface ResultadoDivisao {
  valorBarbeariaCentavos: number;
  valorAtendenteCentavos: number;
}

export function calcularDivisao(dados: DadosDivisao): ResultadoDivisao {
  const {
    papel,
    clienteProprio,
    valorServicoCentavos,
    descontoCentavos,
    gorjetaCentavos,
  } = dados;

  // valor base do serviço já com o desconto aplicado
  const valorComDesconto = valorServicoCentavos - descontoCentavos;

  // Caso 1: dono atende → 100% da barbearia
  if (papel === "dono") {
    return {
      valorBarbeariaCentavos: valorComDesconto,
      valorAtendenteCentavos: gorjetaCentavos, // gorjeta é sempre de quem atendeu
    };
  }

  // Caso 2: parceiro2 com cliente próprio → 100% do parceiro
  if (papel === "parceiro2" && clienteProprio) {
    return {
      valorBarbeariaCentavos: 0,
      valorAtendenteCentavos: valorComDesconto + gorjetaCentavos,
    };
  }

  // Caso 3: parceiro1, ou parceiro2 com walk-in → divisão 50/50
  const metade = Math.floor(valorComDesconto / 2);
  return {
    valorBarbeariaCentavos: valorComDesconto - metade, // a barbearia fica com a sobra do centavo ímpar
    valorAtendenteCentavos: metade + gorjetaCentavos,
  };
}
