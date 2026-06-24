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
