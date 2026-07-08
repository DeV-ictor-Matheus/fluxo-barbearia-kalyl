// Traduz a query do GET /relatorio no período completo:
//   { inicio, fimExclusivo }  → intervalo-Brasília meio-aberto (para Entrada.criadoEm)
//   datas: { diaInicioISO, diaFimISO }  → datas civis, para o service derivar o
//           intervalo-UTC-puro das Saidas (competência-de-dia). Fonte única do período.
//
// Modos:
//   ?dia=2026-07-07            → um dia inteiro (Brasília)
//   ?inicio=2026-07-01&fim=... → intervalo do 1º dia ao fim do último
//   (sem parâmetro)            → default: hoje (Brasília)
//
// Precedência: se `dia` vier junto de `inicio`/`fim`, `dia` vence (resto ignorado).
// Erros de entrada inválida → throw AppError(400); o errorHandler central traduz.

import {
  rangeDoDiaBrasilia,
  hojeBrasilia,
  validarDataISO,
} from "./datasBrasilia.js";
import { AppError } from "../errors/app-errors.js";

export interface Intervalo {
  inicio: Date;
  fimExclusivo: Date;
  datas: { diaInicioISO: string; diaFimISO: string };
}

/** Shape cru de query params do Express: string | string[] | undefined. */
type QueryValor = string | string[] | undefined;
export interface QueryRelatorio {
  dia?: QueryValor;
  inicio?: QueryValor;
  fim?: QueryValor;
}

/**
 * Normaliza um query param pra string única. Express entrega array quando o
 * param se repete (?dia=a&dia=b) — rejeitamos: ambiguidade não passa silenciosa
 * numa leitura financeira.
 */
function comoStringUnica(valor: QueryValor, campo: string): string | undefined {
  if (valor === undefined) return undefined;
  if (Array.isArray(valor)) {
    throw new AppError(
      `Parâmetro '${campo}' foi informado mais de uma vez`,
      400,
    );
  }
  return valor;
}

export function parseIntervaloQuery(query: QueryRelatorio): Intervalo {
  const dia = comoStringUnica(query.dia, "dia");
  const inicio = comoStringUnica(query.inicio, "inicio");
  const fim = comoStringUnica(query.fim, "fim");

  // Modo 1 — dia único. Precede o modo intervalo.
  if (dia !== undefined) {
    const d = validarDataISO(dia, "dia");
    return {
      ...rangeDoDiaBrasilia(d),
      datas: { diaInicioISO: d, diaFimISO: d },
    };
  }

  // Modo 2 — intervalo. Exige AMBOS presentes.
  if (inicio !== undefined || fim !== undefined) {
    if (inicio === undefined || fim === undefined) {
      throw new AppError(
        "Para intervalo, informe 'inicio' e 'fim' juntos",
        400,
      );
    }
    const inicioValido = validarDataISO(inicio, "inicio");
    const fimValido = validarDataISO(fim, "fim");

    // Intervalo invertido → erro. Comparação lexicográfica de YYYY-MM-DD é
    // segura: o formato ISO ordena igual à cronologia.
    if (fimValido < inicioValido) {
      throw new AppError("'fim' não pode ser anterior a 'inicio'", 400);
    }

    return {
      inicio: rangeDoDiaBrasilia(inicioValido).inicio,
      fimExclusivo: rangeDoDiaBrasilia(fimValido).fimExclusivo,
      datas: { diaInicioISO: inicioValido, diaFimISO: fimValido },
    };
  }

  // Modo 3 — nenhum parâmetro. Default: hoje em Brasília.
  const hoje = hojeBrasilia();
  return {
    ...rangeDoDiaBrasilia(hoje),
    datas: { diaInicioISO: hoje, diaFimISO: hoje },
  };
}
