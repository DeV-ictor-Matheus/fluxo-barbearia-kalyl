// Estado de rotação do carrossel do balcão. UI puro — nada de servidor.
// Avança o índice em ciclo (0 → 1 → 2 → 0) a cada `intervaloMs`.
//
// Garantias:
//  - cleanup do timer (sem vazamento entre renders);
//  - pausa quando a aba perde foco (document.hidden) — não gira tela invisível;
//  - índice sempre válido por DERIVAÇÃO (indice % total), não por setState num
//    efeito — evita renders em cascata (regra react-hooks/set-state-in-effect);
//  - respeita prefers-reduced-motion: sem auto-rotação (acessibilidade).

import { useEffect, useState } from "react";

interface UseCarrosselOptions {
  /** Quantos itens há no ciclo (barbeiros ativos). */
  total: number;
  /** Intervalo entre trocas, em ms. Default 4000. */
  intervaloMs?: number;
}

export function useCarrossel({
  total,
  intervaloMs = 4000,
}: UseCarrosselOptions) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    // Nada a rotacionar com 0 ou 1 item — um único barbeiro fica fixo.
    if (total <= 1) return;

    // Acessibilidade: se o sistema pede menos movimento, não auto-rotaciona.
    const prefereMenosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefereMenosMovimento) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const iniciar = () => {
      timer = setInterval(() => {
        setIndice((i) => (i + 1) % total);
      }, intervaloMs);
    };

    const parar = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    // Pausa a rotação quando a tela do balcão sai de foco; retoma ao voltar.
    const aoMudarVisibilidade = () => {
      if (document.hidden) parar();
      else if (!timer) iniciar();
    };

    iniciar();
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      parar();
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [total, intervaloMs]);

  // Índice seguro derivado: se a lista encolheu (barbeiro desativado no
  // refetch), o módulo "dá a volta" para uma posição válida — sem estado extra.
  return total > 0 ? indice % total : 0;
}
