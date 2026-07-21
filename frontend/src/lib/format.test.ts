import { describe, it, expect } from "vitest";
import { formatarCentavos, formatarHora } from "@/lib/format";
import { reaisParaCentavos } from "@/lib/format";

// Normaliza qualquer espaço (incluindo o non-breaking space \u00A0 e o
// narrow no-break \u202F que o Intl pt-BR usa) para um espaço comum,
// para que os asserts não dependam do byte exato de espaçamento do ICU.
function normalizarEspacos(texto: string): string {
  return texto.replace(/\s/g, " ");
}

describe("formatarCentavos", () => {
  it("converte centavos inteiros em Real formatado", () => {
    expect(normalizarEspacos(formatarCentavos(5000))).toBe("R$ 50,00");
  });

  it("aplica separador de milhar", () => {
    expect(normalizarEspacos(formatarCentavos(123456))).toBe("R$ 1.234,56");
  });

  it("formata zero corretamente", () => {
    expect(normalizarEspacos(formatarCentavos(0))).toBe("R$ 0,00");
  });

  it("mantém duas casas decimais em valores sem centavos", () => {
    expect(normalizarEspacos(formatarCentavos(10000))).toBe("R$ 100,00");
  });

  it("formata valores negativos (ex.: estorno de Saída)", () => {
    // O Intl pt-BR usa o prefixo "-R$" para negativos.
    expect(normalizarEspacos(formatarCentavos(-5000))).toBe("-R$ 50,00");
  });

  it("preserva o último centavo sem perda (regra do domínio)", () => {
    // 1 centavo nunca pode sumir — pilar da integridade financeira.
    expect(normalizarEspacos(formatarCentavos(1))).toBe("R$ 0,01");
  });
});

describe("formatarHora", () => {
  it("converte UTC para o horário de Brasília (UTC-3)", () => {
    // 17:49 UTC = 14:49 em Brasília. O teste PROVA o fuso, não só o formato.
    expect(formatarHora("2026-06-30T17:49:29.839Z")).toBe("14:49");
  });

  it("formata com dois dígitos em horas e minutos", () => {
    // 12:05 UTC = 09:05 BRT — confirma o zero-padding (09, não 9).
    expect(formatarHora("2026-06-30T12:05:00.000Z")).toBe("09:05");
  });

  it("cruza a meia-noite corretamente (UTC-3 puxa para o dia anterior)", () => {
    // 02:30 UTC do dia 30 = 23:30 BRT do dia 29. Prova que a conversão
    // de fuso considera a virada de data, não só subtrai 3 das horas.
    expect(formatarHora("2026-06-30T02:30:00.000Z")).toBe("23:30");
  });
});

describe("reaisParaCentavos", () => {
  it("converte reais com vírgula em centavos", () => {
    expect(reaisParaCentavos("50,00")).toBe(5000);
  });

  it("converte reais com ponto em centavos", () => {
    expect(reaisParaCentavos("50.00")).toBe(5000);
  });

  it("arredonda para o centavo mais próximo", () => {
    expect(reaisParaCentavos("10,555")).toBe(1056);
  });

  it("devolve 0 para texto vazio", () => {
    expect(reaisParaCentavos("")).toBe(0);
  });

  it("devolve 0 para texto não numérico", () => {
    expect(reaisParaCentavos("abc")).toBe(0);
  });

  it("devolve 0 para valor negativo", () => {
    expect(reaisParaCentavos("-10")).toBe(0);
  });
});
