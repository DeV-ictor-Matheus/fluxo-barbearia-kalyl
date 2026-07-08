// "Hoje" em Brasília (UTC-3) no formato YYYY-MM-DD, independente do fuso do
// dispositivo. Espelha a hojeBrasilia() do backend: o dia do relatório é
// sempre o dia da barbearia, não o do navegador de quem abre o app.
const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000;

export function hojeBrasilia(): string {
  const agora = new Date(Date.now() - OFFSET_BRASILIA_MS);
  return agora.toISOString().slice(0, 10);
}
