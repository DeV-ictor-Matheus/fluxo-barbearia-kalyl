import { z } from "zod";

// A lista do enum precisa bater EXATAMENTE com o CategoriaSaida do schema.prisma.
// Repetimos aqui porque o Zod valida em runtime (o Prisma valida o banco e o Zod valida a API)
const CATEGORIAS = [
  "ALUGUEL",
  "TAXA_CARTAO",
  "PRODUTOS",
  "ALUGUEL_POS",
  "SALARIO",
  "CONTAS",
  "MARKETING",
  "OUTROS",
] as const;

export const criarSaidaSchema = z.object({
  descricao: z.string().trim().optional(),
  valorCentavos: z
    .number({ message: "valorCentavos deve ser um número" })
    .int("valorCentavos deve ser inteiro (centavos, não reais)")
    .positive("valorCentavos deve ser maior que zero"),
  categoria: z.enum(CATEGORIAS, {
    message: "categoria inválida — use um dos valores permitidos",
  }),
  recorrente: z.boolean().default(false),
  // coerce.date() aceita tanto string ISO ("2026-06-04") quanto Date,
  // e converte pra Date. Sem restrição de futuro — decidimos permitir.
  data: z.coerce.date({ message: "data inválida" }),
});

// O tipo TypeScript nasce do schema — fonte única, sem repetição.
export type CriarSaidaInput = z.infer<typeof criarSaidaSchema>;
