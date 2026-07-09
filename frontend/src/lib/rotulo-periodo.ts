import type { Periodo } from "@/types/relatorio";
import { isoParaData } from "@/lib/data-iso";
import { hojeBrasilia } from "@/lib/hoje-brasilia";

// Monta o rótulo curto do botão que abre o seletor de período.
//
// Casos:
//   dia = hoje            -> "Hoje · 8 jul"
//   dia != hoje           -> "8 jul"
//   intervalo mesmo mês   -> "1–7 jul"        (mês só na ponta final)
//   intervalo meses dif.  -> "28 jun – 5 jul" (mês nas duas pontas)
//
// Converte as strings ISO do Periodo via isoParaData (componentes locais,
// nunca new Date(iso) cru que passa por UTC e erra o dia) e formata o mês
// abreviado em pt-BR. A comparação "é hoje?" é feita entre strings ISO —
// exata e imune a hora/fuso.

const EN_DASH = "–";
const SEP = "·";

function diaDoMes(iso: string): string {
  return String(isoParaData(iso).getDate());
}

function mesAbrev(iso: string): string {
  // "jul" — sem ponto final (toLocaleDateString varia por ambiente; normalizo).
  return isoParaData(iso)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

function mesmoMes(inicioISO: string, fimISO: string): boolean {
  // Compara ano+mês pelo prefixo "YYYY-MM" — sem instanciar Date.
  return inicioISO.slice(0, 7) === fimISO.slice(0, 7);
}

export function rotuloPeriodo(periodo: Periodo): string {
  if (periodo.tipo === "dia") {
    const texto = `${diaDoMes(periodo.dia)} ${mesAbrev(periodo.dia)}`;
    return periodo.dia === hojeBrasilia() ? `Hoje ${SEP} ${texto}` : texto;
  }

  const { inicio, fim } = periodo;
  if (mesmoMes(inicio, fim)) {
    // "1–7 jul": dias colados pelo en-dash, mês uma vez só no fim.
    return `${diaDoMes(inicio)}${EN_DASH}${diaDoMes(fim)} ${mesAbrev(fim)}`;
  }
  // "28 jun – 5 jul": mês nas duas pontas, en-dash com espaços.
  return `${diaDoMes(inicio)} ${mesAbrev(inicio)} ${EN_DASH} ${diaDoMes(fim)} ${mesAbrev(fim)}`;
}
