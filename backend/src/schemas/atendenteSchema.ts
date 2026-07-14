import { z } from "zod";

// Papéis aceitos. Espelha o comentário do model Atendente (papel é String no banco,
// sem enum nativo). Este array é a única fonte de verdade em runtime.
export const PAPEIS = ["dono", "parceiro1", "parceiro2"] as const;

export const criarAtendenteSchema = z
  .object({
    // Rótulo de exibição, não nome completo. Teto de 20 é contrato de layout:
    // aparece em botão (Tela E), carrossel (Dashboard) e coluna (Relatório).
    // min(1) pós-trim garante que nome[0] sempre produza uma inicial válida (K/I/L).
    nome: z
      .string({ message: "nome é obrigatório" })
      .trim()
      .min(1, "nome não pode ser vazio")
      .max(20, "nome deve ter no máximo 20 caracteres"),

    papel: z.enum(PAPEIS, {
      message: "papel inválido — use dono, parceiro1 ou parceiro2",
    }),
  })
  // .strict() rejeita campos não previstos — inclusive "id", "ativo" e "entradas".
  // É o que impede mass assignment via prisma.create({ data: req.body }).
  .strict();

export type CriarAtendenteInput = z.infer<typeof criarAtendenteSchema>;
