import { describe, it, expect } from "vitest";
import { estadoLiquido } from "./estado-liquido";

describe("estadoLiquido", () => {
  it("líquido positivo → lucro", () => {
    expect(estadoLiquido(10660)).toBe("lucro");
  });

  it("líquido negativo → prejuizo", () => {
    expect(estadoLiquido(-7000)).toBe("prejuizo");
  });

  it("líquido zero → neutro", () => {
    expect(estadoLiquido(0)).toBe("neutro");
  });
});
