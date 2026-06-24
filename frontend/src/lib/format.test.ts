import { describe, it, expect } from "vitest";
import { formatarCentavos } from "@/lib/format";

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
