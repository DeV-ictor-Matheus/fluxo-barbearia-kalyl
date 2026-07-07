import { describe, it, expect } from "vitest";
import {
  montarRelatorio,
  type LinhaFaturamento,
  type AtendenteRef,
} from "../relatorio.js";

// Três barbeiros do domínio (K/I/L). IDs fake — o core não conhece UUID real.
const KALYL: AtendenteRef = { id: "k", nome: "Kalyl" };
const IGOR: AtendenteRef = { id: "i", nome: "Igor" };
const LUCAS: AtendenteRef = { id: "l", nome: "Lucas" };
const TRES = [KALYL, IGOR, LUCAS];

// Helper: constrói uma linha já consolidada (como o service traduziria a Entrada).
function linha(over: Partial<LinhaFaturamento>): LinhaFaturamento {
  return {
    atendenteId: "k",
    valorBarbeariaCentavos: 0,
    valorAtendenteCentavos: 0,
    gorjetaCentavos: 0,
    descontoCentavos: 0,
    ...over,
  };
}

function acharAtendente(rel: ReturnType<typeof montarRelatorio>, id: string) {
  return rel.porAtendente.find((a) => a.atendenteId === id)!;
}

describe("montarRelatorio", () => {
  it("lista vazia → zero-fill dos três atendentes e total zerado", () => {
    const rel = montarRelatorio([], TRES);

    expect(rel.porAtendente).toHaveLength(3);
    for (const a of rel.porAtendente) {
      expect(a).toMatchObject({ casa: 0, repasse: 0, gorjeta: 0, desconto: 0 });
    }
    expect(rel.total).toEqual({ casa: 0, repasse: 0, gorjeta: 0, desconto: 0 });
  });

  it("dono (tabela casa) → tudo em casa, repasse zero", () => {
    // Serviço R$100 do Kalyl, sem gorjeta: calcularDivisao daria
    // barbearia=10000, atendente=0.
    const rel = montarRelatorio(
      [linha({ atendenteId: "k", valorBarbeariaCentavos: 10000 })],
      TRES,
    );
    const k = acharAtendente(rel, "k");
    expect(k).toMatchObject({
      casa: 10000,
      repasse: 0,
      gorjeta: 0,
      desconto: 0,
    });
  });

  it("parceiro walk-in 50/50 → repasse líquido separa a gorjeta (Opção X)", () => {
    // Serviço R$80 do Igor com gorjeta R$10.
    // calcularDivisao: barbearia=4000, atendente=metade(4000)+1000=5000.
    // repasse líquido esperado = 5000 - 1000 = 4000; gorjeta = 1000.
    const rel = montarRelatorio(
      [
        linha({
          atendenteId: "i",
          valorBarbeariaCentavos: 4000,
          valorAtendenteCentavos: 5000,
          gorjetaCentavos: 1000,
        }),
      ],
      TRES,
    );
    const i = acharAtendente(rel, "i");
    expect(i).toMatchObject({
      casa: 4000,
      repasse: 4000, // NÃO 5000 — gorjeta não vaza pro repasse
      gorjeta: 1000,
      desconto: 0,
    });
  });

  it("parceiro2 com clienteProprio → 100% no repasse, casa zero", () => {
    // Serviço R$80 do Lucas, cliente próprio, gorjeta R$5.
    // calcularDivisao: barbearia=0, atendente=8000+500=8500.
    // repasse líquido = 8500 - 500 = 8000; gorjeta = 500.
    const rel = montarRelatorio(
      [
        linha({
          atendenteId: "l",
          valorBarbeariaCentavos: 0,
          valorAtendenteCentavos: 8500,
          gorjetaCentavos: 500,
        }),
      ],
      TRES,
    );
    const l = acharAtendente(rel, "l");
    expect(l).toMatchObject({
      casa: 0,
      repasse: 8000,
      gorjeta: 500,
      desconto: 0,
    });
  });

  it("desconto é agregado como coluna informativa própria", () => {
    const rel = montarRelatorio(
      [
        linha({
          atendenteId: "k",
          valorBarbeariaCentavos: 9000,
          descontoCentavos: 1000,
        }),
      ],
      TRES,
    );
    expect(acharAtendente(rel, "k").desconto).toBe(1000);
    expect(rel.total.desconto).toBe(1000);
  });

  it("acumula múltiplas linhas do mesmo atendente", () => {
    const rel = montarRelatorio(
      [
        linha({
          atendenteId: "i",
          valorBarbeariaCentavos: 4000,
          valorAtendenteCentavos: 4000,
        }),
        linha({
          atendenteId: "i",
          valorBarbeariaCentavos: 3000,
          valorAtendenteCentavos: 3000,
        }),
      ],
      TRES,
    );
    const i = acharAtendente(rel, "i");
    expect(i.casa).toBe(7000);
    expect(i.repasse).toBe(7000);
  });

  it("faturamento de atendente fora da lista é ignorado (não cria linha)", () => {
    const rel = montarRelatorio(
      [linha({ atendenteId: "fantasma", valorBarbeariaCentavos: 5000 })],
      TRES,
    );
    expect(rel.porAtendente).toHaveLength(3);
    expect(rel.total.casa).toBe(0); // não somou o fantasma
  });

  it("INVARIANTE: total === soma de cada campo em porAtendente", () => {
    const linhas: LinhaFaturamento[] = [
      linha({
        atendenteId: "k",
        valorBarbeariaCentavos: 10000,
        gorjetaCentavos: 200,
        valorAtendenteCentavos: 200,
      }),
      linha({
        atendenteId: "i",
        valorBarbeariaCentavos: 4000,
        valorAtendenteCentavos: 5000,
        gorjetaCentavos: 1000,
        descontoCentavos: 500,
      }),
      linha({
        atendenteId: "l",
        valorBarbeariaCentavos: 0,
        valorAtendenteCentavos: 8500,
        gorjetaCentavos: 500,
      }),
    ];
    const rel = montarRelatorio(linhas, TRES);

    const soma = (campo: "casa" | "repasse" | "gorjeta" | "desconto") =>
      rel.porAtendente.reduce((s, a) => s + a[campo], 0);

    expect(rel.total.casa).toBe(soma("casa"));
    expect(rel.total.repasse).toBe(soma("repasse"));
    expect(rel.total.gorjeta).toBe(soma("gorjeta"));
    expect(rel.total.desconto).toBe(soma("desconto"));
  });
});
