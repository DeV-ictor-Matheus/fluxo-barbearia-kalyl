// Tipo de domínio da Entrada — espelha o model Prisma `Entrada` do backend.
// Fonte de verdade: backend/prisma/schema.prisma (model Entrada).
//
// Nota: este shape representa a Entrada COMO TRAFEGA NO JSON da resposta HTTP.
// `criadoEm` é DateTime no Prisma, mas chega serializado como string ISO 8601.
// Relações (atendente, servico) NÃO entram aqui: o create do backend não usa
// `include`, então a resposta traz apenas escalares + chaves estrangeiras.

/** Tabela de preço congelada na entrada. String no Prisma, restrita aqui. */
export type TabelaAplicada = "casa" | "parceiro2";

/** Método de pagamento. String no Prisma, restrito aqui (lowercase, ASCII). */
export type MetodoPagamento = "pix" | "cartao" | "dinheiro";

export interface Entrada {
  id: string;
  atendenteId: string;
  servicoId: string;
  tabelaAplicada: TabelaAplicada;
  clienteProprio: boolean;
  valorServicoCentavos: number;
  descontoCentavos: number;
  gorjetaCentavos: number;
  valorBarbeariaCentavos: number;
  valorAtendenteCentavos: number;
  metodoPagamento: MetodoPagamento;
  /** ISO 8601 string (DateTime no Prisma, serializado na resposta HTTP). */
  criadoEm: string;
}
