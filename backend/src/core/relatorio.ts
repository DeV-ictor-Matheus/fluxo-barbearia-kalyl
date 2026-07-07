// Função pura que agrega o faturamento por atendente num período já filtrado.
// NÃO recalcula divisão: cada linha já traz o resultado consolidado de
// `calcularDivisao` (Entrada é imutável — a divisão foi "queimada" no fato).
// Aqui é só soma determinística. Sem I/O, sem Prisma, sem datas.
//
// Regra de campo: os quatro valores por atendente são mutuamente
// exclusivos:
//   - casa     = parte da barbearia (valorBarbeariaCentavos)
//   - repasse  = parte do atendente por SERVIÇO, líquida de gorjeta
//                (valorAtendenteCentavos - gorjetaCentavos)
//   - gorjeta  = gorjeta isolada (gorjetaCentavos)
//   - desconto = desconto concedido (descontoCentavos), informativo
//
// `valorAtendenteCentavos` já embute a gorjeta (ver calcularDivisao), por isso
// a subtraímos aqui para não contar a gorjeta duas vezes.

/** Uma linha de faturamento já consolidada — linguagem do domínio, não do ORM. */
export interface LinhaFaturamento {
  atendenteId: string;
  valorBarbeariaCentavos: number;
  valorAtendenteCentavos: number; // inclui gorjeta
  gorjetaCentavos: number;
  descontoCentavos: number;
}

/** Atendente a exibir/zerar no relatório (zero-fill vem daqui, não de constante mágica). */
export interface AtendenteRef {
  id: string;
  nome: string;
}

/** Bloco de valores agregados (por atendente e no total). */
export interface BlocoValores {
  casa: number;
  repasse: number;
  gorjeta: number;
  desconto: number;
}

/** Linha do relatório por atendente: identidade + valores. */
export interface RelatorioAtendente extends BlocoValores {
  atendenteId: string;
  nome: string;
}

export interface Relatorio {
  porAtendente: RelatorioAtendente[];
  total: BlocoValores;
}

function blocoZero(): BlocoValores {
  return { casa: 0, repasse: 0, gorjeta: 0, desconto: 0 };
}

export function montarRelatorio(
  linhas: LinhaFaturamento[],
  atendentes: AtendenteRef[],
): Relatorio {
  // Zero-fill como invariante: o acumulador nasce com TODOS os atendentes
  // zerados, antes de varrer o faturamento. Atendente sem movimento no
  // período retorna zeros — nunca undefined, nunca chave faltando.
  const acc = new Map<string, RelatorioAtendente>();
  for (const a of atendentes) {
    acc.set(a.id, { atendenteId: a.id, nome: a.nome, ...blocoZero() });
  }

  const total = blocoZero();

  for (const linha of linhas) {
    const alvo = acc.get(linha.atendenteId);
    // Faturamento de um atendente fora da lista fornecida é ignorado
    // silenciosamente: a lista de atendentes define o universo do relatório.
    // (Ex.: atendente soft-deleted que não deve mais aparecer.)
    if (!alvo) continue;

    const repasseLiquido = linha.valorAtendenteCentavos - linha.gorjetaCentavos;

    alvo.casa += linha.valorBarbeariaCentavos;
    alvo.repasse += repasseLiquido;
    alvo.gorjeta += linha.gorjetaCentavos;
    alvo.desconto += linha.descontoCentavos;

    total.casa += linha.valorBarbeariaCentavos;
    total.repasse += repasseLiquido;
    total.gorjeta += linha.gorjetaCentavos;
    total.desconto += linha.descontoCentavos;
  }

  return { porAtendente: [...acc.values()], total };
}
