import { describe, it, expect, vi, afterEach } from "vitest";
import { rotuloPeriodo } from "./rotulo-periodo";

afterEach(() => vi.useRealTimers());

// Fixa "hoje" em 8 jul 2026 para o caso do prefixo "Hoje ·".
// 8 jul 12:00 UTC → 09h Brasília → dia 8. Estável.
function fixaHoje() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-08T12:00:00.000Z"));
}

describe("rotuloPeriodo — dia único", () => {
  it("prefixa 'Hoje ·' quando o dia é hoje", () => {
    fixaHoje();
    expect(rotuloPeriodo({ tipo: "dia", dia: "2026-07-08" })).toBe(
      "Hoje · 8 jul",
    );
  });

  it("omite 'Hoje' quando o dia não é hoje", () => {
    fixaHoje();
    expect(rotuloPeriodo({ tipo: "dia", dia: "2026-07-05" })).toBe("5 jul");
  });

  it("usa o dia LOCAL do ISO, não erra por fuso", () => {
    fixaHoje();
    // Se usasse new Date("2026-07-01") cru (UTC), em BR daria 30 jun.
    expect(rotuloPeriodo({ tipo: "dia", dia: "2026-07-01" })).toBe("1 jul");
  });
});

describe("rotuloPeriodo — intervalo", () => {
  it("mesmo mês: mês só na ponta final ('1–7 jul')", () => {
    expect(
      rotuloPeriodo({
        tipo: "intervalo",
        inicio: "2026-07-01",
        fim: "2026-07-07",
      }),
    ).toBe("1–7 jul");
  });

  it("meses diferentes: mês nas duas pontas ('28 jun – 5 jul')", () => {
    expect(
      rotuloPeriodo({
        tipo: "intervalo",
        inicio: "2026-06-28",
        fim: "2026-07-05",
      }),
    ).toBe("28 jun – 5 jul");
  });

  it("intervalo de um único dia (pontas iguais)", () => {
    expect(
      rotuloPeriodo({
        tipo: "intervalo",
        inicio: "2026-07-03",
        fim: "2026-07-03",
      }),
    ).toBe("3–3 jul");
  });

  it("usa en-dash (–), não hífen (-)", () => {
    const r = rotuloPeriodo({
      tipo: "intervalo",
      inicio: "2026-07-01",
      fim: "2026-07-07",
    });
    expect(r).toContain("–");
    expect(r).not.toContain("-");
  });
});
