import { describe, it, expect } from "vitest";
import { dataParaISO, isoParaData } from "./data-iso";

describe("dataParaISO", () => {
  it("usa componentes locais, não UTC", () => {
    const d = new Date(2026, 6, 8); // mês 0-indexed: 6 = julho
    expect(dataParaISO(d)).toBe("2026-07-08");
  });
  it("preenche zero à esquerda em mês e dia", () => {
    const d = new Date(2026, 0, 5); // 5 jan
    expect(dataParaISO(d)).toBe("2026-01-05");
  });
  it("meia-noite local não vira dia anterior", () => {
    const d = new Date(2026, 6, 8, 0, 0, 0);
    expect(dataParaISO(d)).toBe("2026-07-08");
  });
});

describe("isoParaData", () => {
  it("cria Date em meia-noite local", () => {
    const d = isoParaData("2026-07-08");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(8);
  });
  it("round-trip: dataParaISO(isoParaData(x)) === x", () => {
    expect(dataParaISO(isoParaData("2026-12-25"))).toBe("2026-12-25");
  });
});
