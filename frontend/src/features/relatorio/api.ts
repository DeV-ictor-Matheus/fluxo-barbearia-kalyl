import { api } from "@/lib/api-client";
import type { Periodo, Relatorio } from "@/types/relatorio";

// Traduz o Periodo escolhido na tela em query string e busca o relatório.
// O backend aceita ?dia= (dia único) ou ?inicio=&fim= (intervalo).
// URLSearchParams escapa os valores — sem concatenação manual frágil.
export function buscarRelatorio(periodo: Periodo): Promise<Relatorio> {
  const params = new URLSearchParams();
  if (periodo.tipo === "dia") {
    params.set("dia", periodo.dia);
  } else {
    params.set("inicio", periodo.inicio);
    params.set("fim", periodo.fim);
  }
  return api.get<Relatorio>(`/relatorio?${params.toString()}`);
}
