// Converte um Date (do calendário, em horário LOCAL) para "YYYY-MM-DD",
// usando os componentes locais — NÃO toISOString(), que passa por UTC e
// pode jogar o dia para trás. Ex.: Date "8 jul 00:00 America/Sao_Paulo"
// com toISOString() vira "2026-07-08T03:00:00Z" (ok), mas "8 jul 00:00"
// em fusos a leste de UTC viraria o dia 7. Pegar ano/mês/dia locais é
// imune a isso: o que o usuário TOCOU no calendário é o que vai pro backend.
export function dataParaISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Caminho inverso: "YYYY-MM-DD" -> Date em meia-noite LOCAL (não UTC).
// new Date("2026-07-08") é interpretado como UTC; new Date(2026, 6, 8) é
// local. Usamos o construtor por componentes para o calendário destacar o
// dia certo independente do fuso do dispositivo.
export function isoParaData(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}
