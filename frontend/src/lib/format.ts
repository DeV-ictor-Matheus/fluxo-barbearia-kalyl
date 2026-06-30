// Formatação de exibição. Centraliza conversões de dado → texto para que a
// regra apareça em um lugar só (centavos viram Real aqui, e em nenhum outro).

/**
 * Converte centavos inteiros em moeda brasileira para exibição.
 * Ex: 5000 → "R$ 50,00". Usa a API de internacionalização nativa do JS,
 * sem dependência externa.
 *
 * IMPORTANTE: isto é só APRESENTAÇÃO. O valor que trafega e é gravado
 * permanece sempre em centavos inteiros — nunca o número fracionado.
 */
export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte um timestamp ISO (UTC) na hora local da barbearia (Brasília).
 * Ex: "2026-06-30T17:49:29.839Z" → "14:49". Usa a API de internacionalização
 * nativa do JS, sem dependência externa.
 *
 * IMPORTANTE: o fuso é fixado em America/Sao_Paulo, NÃO herdado do navegador.
 * A hora exibida é sempre a hora da barbearia — abra-se de onde for.
 */
export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}
