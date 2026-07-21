// Conversões de dinheiro e tempo entre dado e texto, nos dois sentidos.
// Centraliza a regra em um lugar só: centavos viram Real aqui (e em nenhum
// outro), e texto do usuário vira centavos aqui (e em nenhum outro).

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

/**
 * Converte texto digitado pelo usuário em centavos inteiros.
 * Ex: "50,00" → 5000. Aceita vírgula ou ponto como separador decimal
 * (input type="number" já rejeita vírgula no Chrome, mas alguns
 * teclados Android a entregam).
 *
 * Entrada inválida, vazia ou negativa → 0. Nunca lança: a trava do
 * submit é responsabilidade da tela, não desta função.
 *
 * IMPORTANTE: é a fronteira de entrada do dinheiro. Depois daqui o
 * valor é sempre inteiro em centavos — nunca o número fracionado.
 */
export function reaisParaCentavos(texto: string): number {
  const normalizado = texto.replace(",", ".").trim();
  if (normalizado === "") return 0;
  const reais = Number(normalizado);
  if (Number.isNaN(reais) || reais < 0) return 0;
  return Math.round(reais * 100);
}
