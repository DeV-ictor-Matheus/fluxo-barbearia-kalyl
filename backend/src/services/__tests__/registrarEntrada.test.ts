import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../errors/app-errors.js";

// Mock do Prisma: o service é a unidade sob teste, não o banco.
vi.mock("../../db.js", () => ({
  prisma: {
    atendente: { findUnique: vi.fn() },
    servico: { findUnique: vi.fn() },
    entrada: { create: vi.fn() },
  },
}));

const { prisma } = await import("../../db.js");
const { registrarEntrada } = await import("../registrarEntrada.js");

// Cardápio real da barbearia, em centavos.
const CABELO = {
  id: "srv-cabelo",
  nome: "Cabelo",
  precoCasaCentavos: 7000,
  precoParceiro2Centavos: 5000,
};

// Serviço sem tabela do parceiro — deve cair no preço da casa.
const SOBRANCELHA = {
  id: "srv-sobrancelha",
  nome: "Sobrancelha",
  precoCasaCentavos: 2000,
  precoParceiro2Centavos: null,
};

function mockCenario(
  papel: string,
  servico: typeof CABELO | typeof SOBRANCELHA,
) {
  vi.mocked(prisma.atendente.findUnique).mockResolvedValue({
    id: "at-1",
    nome: "Fulano",
    papel,
    ativo: true,
  } as never);
  vi.mocked(prisma.servico.findUnique).mockResolvedValue(servico as never);
  vi.mocked(prisma.entrada.create).mockImplementation(
    (async ({ data }: { data: unknown }) => data) as never,
  );
}

function entrada(over: Record<string, unknown> = {}) {
  return {
    atendenteId: "at-1",
    servicoId: "srv-cabelo",
    clienteProprio: false,
    descontoCentavos: 0,
    gorjetaCentavos: 0,
    metodoPagamento: "pix",
    ...over,
  } as never;
}

beforeEach(() => vi.clearAllMocks());

describe("registrarEntrada — resolução de preço", () => {
  it("parceiro2 com cliente próprio cobra a tabela dele", async () => {
    mockCenario("parceiro2", CABELO);
    const r = await registrarEntrada(entrada({ clienteProprio: true }));

    expect(r.tabelaAplicada).toBe("parceiro2");
    expect(r.valorServicoCentavos).toBe(5000);
    // 100% dele
    expect(r.valorBarbeariaCentavos).toBe(0);
    expect(r.valorAtendenteCentavos).toBe(5000);
  });

  // Este é o teste que o bug do walk-in não passaria.
  it("parceiro2 em walk-in cobra a tabela da casa e divide 50/50", async () => {
    mockCenario("parceiro2", CABELO);
    const r = await registrarEntrada(entrada({ clienteProprio: false }));

    expect(r.tabelaAplicada).toBe("casa");
    expect(r.valorServicoCentavos).toBe(7000);
    expect(r.valorBarbeariaCentavos).toBe(3500);
    expect(r.valorAtendenteCentavos).toBe(3500);
  });

  it("parceiro1 sempre cobra a tabela da casa", async () => {
    mockCenario("parceiro1", CABELO);
    const r = await registrarEntrada(entrada({ clienteProprio: false }));

    expect(r.tabelaAplicada).toBe("casa");
    expect(r.valorServicoCentavos).toBe(7000);
  });

  it("dono cobra a tabela da casa e 100% vai pra barbearia", async () => {
    mockCenario("dono", CABELO);
    const r = await registrarEntrada(entrada());

    expect(r.tabelaAplicada).toBe("casa");
    expect(r.valorBarbeariaCentavos).toBe(7000);
    expect(r.valorAtendenteCentavos).toBe(0);
  });

  it("serviço sem tabela do parceiro cai no preço da casa", async () => {
    mockCenario("parceiro2", SOBRANCELHA);
    const r = await registrarEntrada(
      entrada({ servicoId: "srv-sobrancelha", clienteProprio: true }),
    );

    expect(r.tabelaAplicada).toBe("casa");
    expect(r.valorServicoCentavos).toBe(2000);
  });
});

describe("registrarEntrada — teto do desconto", () => {
  it("o teto incide sobre o valor RESOLVIDO, não sobre o da casa", async () => {
    mockCenario("parceiro2", CABELO);

    // Serviço resolvido = 5000. Teto = 2500. 2600 deve estourar,
    // mesmo sendo menos que 50% do preço da casa (3500).
    await expect(
      registrarEntrada(
        entrada({ clienteProprio: true, descontoCentavos: 2600 }),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("aceita desconto exatamente no teto", async () => {
    mockCenario("parceiro2", CABELO);
    const r = await registrarEntrada(
      entrada({ clienteProprio: true, descontoCentavos: 2500 }),
    );

    expect(r.valorAtendenteCentavos).toBe(2500);
  });
});
