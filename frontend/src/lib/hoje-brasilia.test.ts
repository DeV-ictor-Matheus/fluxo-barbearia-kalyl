import { describe, it, expect, vi, afterEach } from "vitest";
import { hojeBrasilia } from "./hoje-brasilia";

afterEach(() => vi.useRealTimers());

describe("hojeBrasilia", () => {
  it("retorna no formato YYYY-MM-DD", () => {
    expect(hojeBrasilia()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("22h UTC do dia 8 → ainda dia 8 em Brasília (19h)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T22:00:00.000Z"));
    expect(hojeBrasilia()).toBe("2026-07-08");
  });

  it("02h UTC do dia 9 → ainda dia 8 em Brasília (23h do dia anterior)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-09T02:00:00.000Z"));
    expect(hojeBrasilia()).toBe("2026-07-08");
  });
});
