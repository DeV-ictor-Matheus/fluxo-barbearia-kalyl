export interface BlocoValores {
  casa: number;
  repasse: number;
  gorjeta: number;
  desconto: number;
}

export interface RelatorioAtendente extends BlocoValores {
  atendenteId: string;
  nome: string;
}

export interface Saidas {
  porCategoria: Record<string, number>;
  total: number;
}

export interface Relatorio {
  // O backend serializa Date como string ISO no JSON — por isso string, não Date.
  intervalo: { inicio: string; fimExclusivo: string };
  porAtendente: RelatorioAtendente[];
  totalEntradas: BlocoValores;
  saidas: Saidas;
  liquido: number;
}

// O que o usuário escolhe no seletor. Discriminated union: o `tipo` força
// o tratamento dos dois casos e impede acessar `inicio` num período "dia".
export type Periodo =
  | { tipo: "dia"; dia: string }
  | { tipo: "intervalo"; inicio: string; fim: string };
