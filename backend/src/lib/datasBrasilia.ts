// Helpers de data no fuso de Brasília (UTC-3), independentes do fuso do servidor.
// Centralizados aqui pra não duplicar a lógica entre os services de leitura.

import { AppError } from "../errors/app-errors.js";

// Offset de Brasília (UTC-3). Pragmático pro MVP: o Brasil não observa horário
// de verão atualmente. Se o DST voltar, trocar por date-fns-tz / Luxon.
const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000;

// Formato ISO estrito YYYY-MM-DD.
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}$/;

// Recebe "YYYY-MM-DD" e devolve o início (inclusivo) e o fim (EXCLUSIVO)
// daquele dia em Brasília, expressos em instantes UTC — o intervalo half-open
// [inicio, fimExclusivo) que o Prisma consome com gte/lt.
export function rangeDoDiaBrasilia(dataISO: string): {
  inicio: Date;
  fimExclusivo: Date;
} {
  const inicio = new Date(`${dataISO}T00:00:00.000Z`);
  inicio.setTime(inicio.getTime() + OFFSET_BRASILIA_MS);

  const fimExclusivo = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  return { inicio, fimExclusivo };
}

// Devolve a data de "hoje" em Brasília no formato YYYY-MM-DD.
export function hojeBrasilia(): string {
  const agora = new Date(Date.now() - OFFSET_BRASILIA_MS);
  return agora.toISOString().slice(0, 10);
}

// Intervalo em UTC PURO (meia-noite UTC a meia-noite UTC), meio-aberto.
// Diferente de rangeDoDiaBrasilia: NÃO aplica o offset de Brasília.
//
// Motivo: Saida.data é gravada por `z.coerce.date()` a partir de "YYYY-MM-DD",
// que o JS interpreta como meia-noite UTC (ex: "2026-07-07" -> 2026-07-07T00:00Z).
// Saida é competência-de-DIA (não instante-de-fato como Entrada.criadoEm), então
// filtramos por um intervalo ancorado no mesmo fuso em que foi gravada: UTC puro.
//
// PREMISSA (travada por teste): a data da Saida sempre nasce de uma string
// YYYY-MM-DD via z.coerce.date, portanto sem componente de hora. Se um dia a
// escrita passar um Date com hora real, esta premissa quebra — ver dívida v2
// de normalizar a gravação de Saida.data para meia-noite Brasília.
export function rangeUtcPuro(dataISO: string): {
  inicio: Date;
  fimExclusivo: Date;
} {
  const inicio = new Date(`${dataISO}T00:00:00.000Z`);
  const fimExclusivo = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
  return { inicio, fimExclusivo };
}

// Valida que a string é uma data-calendário real no formato YYYY-MM-DD.
// Checa o formato E a validade civil (rejeita 2026-02-30) via round-trip:
// o Date reconstruído em UTC precisa reemitir exatamente a mesma string.
// Lança AppError(400) — fonte única de verdade pra "data válida" no projeto.
export function validarDataISO(valor: string, campo = "data"): string {
  if (!FORMATO_ISO.test(valor)) {
    throw new AppError(
      `Parâmetro '${campo}' deve estar no formato AAAA-MM-DD`,
      400,
    );
  }
  const d = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== valor) {
    throw new AppError(`Parâmetro '${campo}' não é uma data válida`, 400);
  }
  return valor;
}
