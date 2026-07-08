import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do singleton Prisma. Cada teste injeta os retornos que quiser.
const mockEntradaFindMany = vi.fn();
const mockAtendenteFindMany = vi.fn();
const mockSaidaFindMany = vi.fn();

vi.mock("../../db.js", () => ({
  prisma: {
    entrada: { findMany: (...a: unknown[]) => mockEntradaFindMany(...a) },
    atendente: { findMany: (...a: unknown[]) => mockAtendenteFindMany(...a) },
    saida: { findMany: (...a: unknown[]) => mockSaidaFindMany(...a) },
  },
}));

import { relatorioFinanceiro } from "../relatorioFinanceiro.js";

const ATENDENTES = [
  { id: "k", nome: "Kalyl" },
  { id: "i", nome: "Igor" },
  { id: "l", nome: "Lucas" },
];

// Params de um dia único (07/07) — intervalo-Brasília + datas civis.
function paramsDia07() {
  return {
    inicio: new Date("2026-07-07T03:00:00.000Z"),
    fimExclusivo: new Date("2026-07-08T03:00:00.000Z"),
    datas: { diaInicioISO: "2026-07-07", diaFimISO: "2026-07-07" },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAtendenteFindMany.mockResolvedValue(ATENDENTES);
});

describe("relatorioFinanceiro", () => {
  it("dia sem movimento → zero-fill dos três, saídas vazias, líquido 0", async () => {
    mockEntradaFindMany.mockResolvedValue([]);
    mockSaidaFindMany.mockResolvedValue([]);

    const r = await relatorioFinanceiro(paramsDia07());

    expect(r.porAtendente).toHaveLength(3);
    for (const a of r.porAtendente) {
      expect(a).toMatchObject({ casa: 0, repasse: 0, gorjeta: 0, desconto: 0 });
    }
    expect(r.saidas.total).toBe(0);
    expect(r.saidas.porCategoria).toEqual({});
    expect(r.liquido).toBe(0);
  });

  it("traduz Entrada do Prisma → core e agrega por atendente", async () => {
    mockEntradaFindMany.mockResolvedValue([
      {
        atendenteId: "i",
        valorBarbeariaCentavos: 4000,
        valorAtendenteCentavos: 5000, // inclui gorjeta
        gorjetaCentavos: 1000,
        descontoCentavos: 0,
      },
    ]);
    mockSaidaFindMany.mockResolvedValue([]);

    const r = await relatorioFinanceiro(paramsDia07());
    const i = r.porAtendente.find((a) => a.atendenteId === "i")!;

    // Opção X: repasse líquido de gorjeta.
    expect(i).toMatchObject({ casa: 4000, repasse: 4000, gorjeta: 1000 });
    expect(r.totalEntradas.casa).toBe(4000);
  });

  it("líquido = casa − totalSaidas (decisão A: repasse/gorjeta fora)", async () => {
    mockEntradaFindMany.mockResolvedValue([
      // Kalyl (dono): 100% casa. R$120.
      {
        atendenteId: "k",
        valorBarbeariaCentavos: 12000,
        valorAtendenteCentavos: 0,
        gorjetaCentavos: 0,
        descontoCentavos: 0,
      },
      // Igor (walk-in 50/50): casa 4000, atendente 5000 (com 1000 gorjeta).
      {
        atendenteId: "i",
        valorBarbeariaCentavos: 4000,
        valorAtendenteCentavos: 5000,
        gorjetaCentavos: 1000,
        descontoCentavos: 0,
      },
    ]);
    mockSaidaFindMany.mockResolvedValue([
      { categoria: "ALUGUEL", valorCentavos: 5000 },
      { categoria: "TAXA_CARTAO", valorCentavos: 340 },
    ]);

    const r = await relatorioFinanceiro(paramsDia07());

    // casa = 12000 + 4000 = 16000; saídas = 5340.
    expect(r.totalEntradas.casa).toBe(16000);
    expect(r.saidas.total).toBe(5340);
    // líquido ignora repasse (5000) e gorjeta (1000): 16000 - 5340 = 10660.
    expect(r.liquido).toBe(10660);
  });

  it("agrega saídas por categoria (só categorias com valor)", async () => {
    mockEntradaFindMany.mockResolvedValue([]);
    mockSaidaFindMany.mockResolvedValue([
      { categoria: "ALUGUEL", valorCentavos: 5000 },
      { categoria: "ALUGUEL", valorCentavos: 2000 },
      { categoria: "TAXA_CARTAO", valorCentavos: 340 },
    ]);

    const r = await relatorioFinanceiro(paramsDia07());

    expect(r.saidas.porCategoria).toEqual({ ALUGUEL: 7000, TAXA_CARTAO: 340 });
    expect(r.saidas.porCategoria.PRODUTOS).toBeUndefined();
    expect(r.saidas.total).toBe(7340);
  });

  it("BORDA DE FUSO: Entrada filtra em Brasília, Saida em UTC puro", async () => {
    mockEntradaFindMany.mockResolvedValue([]);
    mockSaidaFindMany.mockResolvedValue([]);

    await relatorioFinanceiro(paramsDia07());

    // Entrada: intervalo-Brasília (03:00Z → 03:00Z do dia seguinte).
    const entradaWhere = mockEntradaFindMany.mock.calls[0][0].where.criadoEm;
    expect(entradaWhere.gte.toISOString()).toBe("2026-07-07T03:00:00.000Z");
    expect(entradaWhere.lt.toISOString()).toBe("2026-07-08T03:00:00.000Z");

    // Saida: intervalo-UTC-puro (00:00Z → 00:00Z do dia seguinte).
    // É ISSO que faz a saída gravada em meia-noite UTC cair no dia certo.
    const saidaWhere = mockSaidaFindMany.mock.calls[0][0].where.data;
    expect(saidaWhere.gte.toISOString()).toBe("2026-07-07T00:00:00.000Z");
    expect(saidaWhere.lt.toISOString()).toBe("2026-07-08T00:00:00.000Z");
  });

  it("intervalo de vários dias: Saida cobre do 1º dia UTC ao fim do último", async () => {
    mockEntradaFindMany.mockResolvedValue([]);
    mockSaidaFindMany.mockResolvedValue([]);

    await relatorioFinanceiro({
      inicio: new Date("2026-07-01T03:00:00.000Z"),
      fimExclusivo: new Date("2026-07-08T03:00:00.000Z"),
      datas: { diaInicioISO: "2026-07-01", diaFimISO: "2026-07-07" },
    });

    const saidaWhere = mockSaidaFindMany.mock.calls[0][0].where.data;
    expect(saidaWhere.gte.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(saidaWhere.lt.toISOString()).toBe("2026-07-08T00:00:00.000Z");
  });

  it("líquido pode ser negativo (saídas > casa)", async () => {
    mockEntradaFindMany.mockResolvedValue([
      {
        atendenteId: "k",
        valorBarbeariaCentavos: 3000,
        valorAtendenteCentavos: 0,
        gorjetaCentavos: 0,
        descontoCentavos: 0,
      },
    ]);
    mockSaidaFindMany.mockResolvedValue([
      { categoria: "ALUGUEL", valorCentavos: 10000 },
    ]);

    const r = await relatorioFinanceiro(paramsDia07());
    expect(r.liquido).toBe(-7000);
  });
});
