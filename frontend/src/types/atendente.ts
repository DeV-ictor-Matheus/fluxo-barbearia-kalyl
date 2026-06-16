export type PapelAtendente = "dono" | "parceiro1" | "parceiro2";

export interface Atendente {
  id: string;
  nome: string;
  papel: PapelAtendente;
  ativo: boolean;
}
