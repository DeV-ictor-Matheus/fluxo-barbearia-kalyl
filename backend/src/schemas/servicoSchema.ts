import { z } from "zod";

export const criarServicoSchema = z
  .object({
    nome: z
      .string({ message: "nome é obrigatório" })
      .min(1, "nome não pode ser vazio"),

    // Preço da tabela da casa, em centavos (inteiro, nunca float/reais).
    precoCasaCentavos: z
      .number({ message: "precoCasaCentavos deve ser um número" })
      .int("precoCasaCentavos deve ser inteiro (centavos, não reais)")
      .min(0, "precoCasaCentavos não pode ser negativo"),

    // Preço da tabela do parceiro2, em centavos.
    precoParceiro2Centavos: z
      .number({ message: "precoParceiro2Centavos deve ser um número" })
      .int("precoParceiro2Centavos deve ser inteiro (centavos, não reais)")
      .min(0, "precoParceiro2Centavos não pode ser negativo"),
  })
  .strict();

export type CriarServicoInput = z.infer<typeof criarServicoSchema>;
