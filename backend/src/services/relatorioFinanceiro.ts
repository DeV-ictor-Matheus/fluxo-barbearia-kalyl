// Orquestra o relatório financeiro de um período. Recebe o intervalo já
// parseado (a rota chama parseIntervaloQuery) e:
//   1. Busca Entradas por criadoEm no intervalo-Brasília (instante-de-fato).
//   2. Traduz cada Entrada do Prisma -> LinhaFaturamento (ORM não entra no core).
//   3. Busca atendentes ativos para o zero-fill (K/I/L).
//   4. Chama montarRelatorio (função pura) -> porAtendente + total.
//   5. Busca Saidas por data no intervalo-UTC-puro (competência-de-dia).
//   6. Agrega Saidas por categoria e monta o líquido = casa - totalSaidas.
//
// Assimetria de fuso (proposital, ver datasBrasilia.rangeUtcPuro):
//   - Entrada.criadoEm  é instante real -> filtra pelo intervalo-Brasília.
//   - Saida.data        é competência-de-dia gravada em meia-noite UTC ->
//                        filtra por um intervalo-UTC-puro derivado das MESMAS
//                        datas civis. Cada tabela no fuso em que foi gravada.

import { prisma } from "../db.js";
import { rangeUtcPuro } from "../lib/datasBrasilia.js";
import {
  montarRelatorio,
  type LinhaFaturamento,
  type AtendenteRef,
  type BlocoValores,
  type RelatorioAtendente,
} from "../core/relatorio.js";

/** Datas civis (YYYY-MM-DD) que delimitam o período, para o filtro de Saida. */
export interface DatasCivis {
  diaInicioISO: string;
  diaFimISO: string;
}

/** Intervalo-Brasília (para Entrada) + datas civis (para derivar o de Saida). */
export interface ParametrosRelatorio {
  inicio: Date;
  fimExclusivo: Date;
  datas: DatasCivis;
}

export interface Saidas {
  porCategoria: Record<string, number>;
  total: number;
}

export interface RelatorioFinanceiro {
  intervalo: { inicio: Date; fimExclusivo: Date };
  porAtendente: RelatorioAtendente[];
  totalEntradas: BlocoValores;
  saidas: Saidas;
  liquido: number;
}

export async function relatorioFinanceiro(
  params: ParametrosRelatorio,
): Promise<RelatorioFinanceiro> {
  const { inicio, fimExclusivo, datas } = params;

  // 1+2. Entradas do período (instante-de-fato) traduzidas para o core.
  const entradas = await prisma.entrada.findMany({
    where: { criadoEm: { gte: inicio, lt: fimExclusivo } },
    select: {
      atendenteId: true,
      valorBarbeariaCentavos: true,
      valorAtendenteCentavos: true,
      gorjetaCentavos: true,
      descontoCentavos: true,
    },
  });

  const linhas: LinhaFaturamento[] = entradas.map((e) => ({
    atendenteId: e.atendenteId,
    valorBarbeariaCentavos: e.valorBarbeariaCentavos,
    valorAtendenteCentavos: e.valorAtendenteCentavos,
    gorjetaCentavos: e.gorjetaCentavos,
    descontoCentavos: e.descontoCentavos,
  }));

  // 3. Atendentes ativos para o zero-fill. Ordem estável por nome.
  const atendentesDb = await prisma.atendente.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  const atendentes: AtendenteRef[] = atendentesDb.map((a) => ({
    id: a.id,
    nome: a.nome,
  }));

  // 4. Função pura: agrega faturamento por atendente + total.
  const { porAtendente, total } = montarRelatorio(linhas, atendentes);

  // 5. Saidas do período. Intervalo-UTC-puro derivado das MESMAS datas civis
  //    (ver assimetria de fuso no topo). Meia-noite UTC do 1º dia até a
  //    meia-noite UTC exclusiva do dia seguinte ao último.
  const saidaInicio = rangeUtcPuro(datas.diaInicioISO).inicio;
  const saidaFimExclusivo = rangeUtcPuro(datas.diaFimISO).fimExclusivo;

  const saidasDb = await prisma.saida.findMany({
    where: { data: { gte: saidaInicio, lt: saidaFimExclusivo } },
    select: { categoria: true, valorCentavos: true },
  });

  // 6. Agrega por categoria (só categorias com valor aparecem) + total.
  const porCategoria: Record<string, number> = {};
  let totalSaidas = 0;
  for (const s of saidasDb) {
    porCategoria[s.categoria] =
      (porCategoria[s.categoria] ?? 0) + s.valorCentavos;
    totalSaidas += s.valorCentavos;
  }

  // Líquido = o que sobra para a CASA. Repasse e gorjeta são 100% do parceiro,
  // nunca foram receita da barbearia — não entram (decisão A).
  const liquido = total.casa - totalSaidas;

  return {
    intervalo: { inicio, fimExclusivo },
    porAtendente,
    totalEntradas: total,
    saidas: { porCategoria, total: totalSaidas },
    liquido,
  };
}
