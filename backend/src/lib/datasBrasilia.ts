// Helpers de data no fuso de Brasília (UTC-3), independentes do fuso do servidor.
// Centralizados aqui pra não duplicar a lógica entre os services de leitura.

// Offset de Brasília (UTC-3). Pragmático pro MVP: o Brasil não observa horário
// de verão atualmente. Se o DST voltar, trocar por date-fns-tz / Luxon.
const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000;

// Recebe "YYYY-MM-DD" e devolve o início e o fim daquele dia em Brasília,
// expressos em instantes UTC (que é como o Postgres compara o DateTime).
export function rangeDoDiaBrasilia(dataISO: string): {
  inicio: Date;
  fim: Date;
} {
  const inicio = new Date(`${dataISO}T00:00:00.000Z`);
  inicio.setTime(inicio.getTime() + OFFSET_BRASILIA_MS);

  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { inicio, fim };
}

// Devolve a data de "hoje" em Brasília no formato YYYY-MM-DD.
export function hojeBrasilia(): string {
  const agora = new Date(Date.now() - OFFSET_BRASILIA_MS);
  return agora.toISOString().slice(0, 10);
}
