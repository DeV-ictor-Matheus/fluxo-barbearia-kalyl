import type { BarbeiroResumo } from "@/types/resumo";

/**
 * Retorna o atendenteId do barbeiro com estritamente mais entradas no dia,
 * ou null se houver empate no topo (inclui o empate 0-0-0 do início do dia).
 * "Estritamente maior" exige um máximo único — empate no topo não coroa ninguém.
 */
export function encontrarLider(porBarbeiro: BarbeiroResumo[]): string | null {
  let liderId: string | null = null;
  let maior = -Infinity;
  let empatado = false;

  for (const b of porBarbeiro) {
    if (b.quantidade > maior) {
      maior = b.quantidade;
      liderId = b.atendenteId;
      empatado = false;
    } else if (b.quantidade === maior) {
      empatado = true;
    }
  }

  return empatado ? null : liderId;
}
