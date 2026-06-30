import { useMemo, useState } from "react";
import type { EntradaResumida } from "@/types/entrada";

/**
 * Estado e lógica do filtro por barbeiro da Tela G. Os chips vêm do resumo
 * (sempre os 3 ativos, com zero-fill); este hook só cuida da seleção e de
 * filtrar a lista client-side — a lista já está em memória, filtrar é
 * esconder, não re-buscar. selecionado = null significa "Todos".
 */
export function useFiltroBarbeiro(entradas: EntradaResumida[]) {
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const entradasFiltradas = useMemo(() => {
    if (selecionado === null) return entradas;
    return entradas.filter((e) => e.atendente.id === selecionado);
  }, [entradas, selecionado]);

  return { selecionado, setSelecionado, entradasFiltradas };
}
