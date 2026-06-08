import { z } from "zod";

// Métodos de pagamento aceitos. Espelha o que o front oferece no dropdown
// e o que o banco grava em Entrada.metodoPagamento (String).
const METODOS_PAGAMENTO = ["pix", "cartao", "dinheiro"] as const;

export const criarEntradaSchema = z
  .object({
    atendenteId: z
      .string({ message: "atendenteId é obrigatório" })
      .uuid("atendenteId deve ser um UUID"),
    servicoId: z
      .string({ message: "servicoId é obrigatório" })
      .uuid("servicoId deve ser um UUID"),

    // Só faz diferença pro parceiro2; default false = walk-in se o front não mandar.
    clienteProprio: z.boolean().default(false),

    // Teto de 50% NÃO entra aqui: depende do preço do serviço (vem do banco).
    descontoCentavos: z
      .number({ message: "descontoCentavos deve ser um número" })
      .int("descontoCentavos deve ser inteiro (centavos, não reais)")
      .min(0, "descontoCentavos não pode ser negativo")
      .default(0),

    gorjetaCentavos: z
      .number({ message: "gorjetaCentavos deve ser um número" })
      .int("gorjetaCentavos deve ser inteiro (centavos, não reais)")
      .min(0, "gorjetaCentavos não pode ser negativo")
      .default(0),

    metodoPagamento: z.enum(METODOS_PAGAMENTO, {
      message: "metodoPagamento inválido — use pix, cartao ou dinheiro",
    }),
  })
  // .strict() rejeita campos não previstos — inclusive "papel" e valores calculados,
  // que o backend deriva/congela e o cliente nunca envia.
  .strict();

export type CriarEntradaInput = z.infer<typeof criarEntradaSchema>;
