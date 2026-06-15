import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fromZonedTime } from "date-fns-tz";
import { rangeDoDiaBrasilia, hojeBrasilia } from "../../lib/datasBrasilia.js";

// Oráculo: o banco de fusos da IANA (America/Sao_Paulo). Em vez de afirmar
// instantes calculados à mão (circular), comparamos o helper artesanal com a
// fonte autoritativa de fusos. Casos ficam dentro do domínio operacional do
// sistema (datas atuais, sem horário de verão — extinto no Brasil desde 2019).
const TZ = "America/Sao_Paulo";

describe("rangeDoDiaBrasilia", () => {
  it("inicio do dia = meia-noite de Brasília expressa em UTC (03:00Z)", () => {
    const { inicio } = rangeDoDiaBrasilia("2026-06-11");
    expect(inicio.toISOString()).toBe("2026-06-11T03:00:00.000Z");
    expect(inicio.getTime()).toBe(
      fromZonedTime("2026-06-11T00:00:00.000", TZ).getTime(),
    );
  });

  it("fim do dia = último milissegundo, já no dia seguinte em UTC (02:59:59.999Z)", () => {
    const { fim } = rangeDoDiaBrasilia("2026-06-11");
    expect(fim.toISOString()).toBe("2026-06-12T02:59:59.999Z");
    expect(fim.getTime()).toBe(
      fromZonedTime("2026-06-11T23:59:59.999", TZ).getTime(),
    );
  });

  it("o range cobre exatamente 24h - 1ms (sem buraco, sem sobreposição)", () => {
    const { inicio, fim } = rangeDoDiaBrasilia("2026-06-11");
    expect(fim.getTime() - inicio.getTime()).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it("uma entrada às 23:30 de Brasília pertence ao dia (não vaza pro seguinte)", () => {
    const { inicio, fim } = rangeDoDiaBrasilia("2026-06-11");
    // 23:30 de 11/06 em São Paulo = 02:30Z de 12/06. Tem que cair DENTRO.
    const entrada = fromZonedTime("2026-06-11T23:30:00.000", TZ);
    expect(entrada.getTime()).toBeGreaterThanOrEqual(inicio.getTime());
    expect(entrada.getTime()).toBeLessThanOrEqual(fim.getTime());
  });

  it("uma entrada às 00:00 do dia seguinte (Brasília) fica FORA do range", () => {
    const { fim } = rangeDoDiaBrasilia("2026-06-11");
    // meia-noite de 12/06 em São Paulo = 03:00Z de 12/06, logo acima do fim.
    const proximoDia = fromZonedTime("2026-06-12T00:00:00.000", TZ);
    expect(proximoDia.getTime()).toBeGreaterThan(fim.getTime());
  });

  it("concorda com a IANA na virada de ano (sem off-by-one de dia)", () => {
    const { inicio, fim } = rangeDoDiaBrasilia("2026-12-31");
    expect(inicio.getTime()).toBe(
      fromZonedTime("2026-12-31T00:00:00.000", TZ).getTime(),
    );
    expect(fim.getTime()).toBe(
      fromZonedTime("2026-12-31T23:59:59.999", TZ).getTime(),
    );
  });
});

describe("hojeBrasilia", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna o dia atual de Brasília no formato YYYY-MM-DD", () => {
    // 12:00Z = 09:00 em Brasília, mesmo dia.
    vi.setSystemTime(new Date("2026-06-11T12:00:00.000Z"));
    expect(hojeBrasilia()).toBe("2026-06-11");
  });

  it("às 01:00 UTC ainda é o dia ANTERIOR em Brasília (o caso que o offset existe pra resolver)", () => {
    // 01:00Z de 12/06 = 22:00 de 11/06 em Brasília. Tem que devolver dia 11.
    vi.setSystemTime(new Date("2026-06-12T01:00:00.000Z"));
    expect(hojeBrasilia()).toBe("2026-06-11");
  });

  it("às 03:00 UTC já virou o dia em Brasília (meia-noite local)", () => {
    // 03:00Z de 12/06 = 00:00 de 12/06 em Brasília. Tem que devolver dia 12.
    vi.setSystemTime(new Date("2026-06-12T03:00:00.000Z"));
    expect(hojeBrasilia()).toBe("2026-06-12");
  });
});
