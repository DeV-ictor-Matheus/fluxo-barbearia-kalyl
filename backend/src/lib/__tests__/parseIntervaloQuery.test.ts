import { describe, it, expect } from "vitest";
import { parseIntervaloQuery } from "../parseIntervaloQuery.js";
import { rangeDoDiaBrasilia, hojeBrasilia } from "../datasBrasilia.js";
import { AppError } from "../../errors/app-errors.js";

describe("parseIntervaloQuery", () => {
  describe("modo dia único", () => {
    it("?dia=YYYY-MM-DD → range daquele dia em Brasília", () => {
      const r = parseIntervaloQuery({ dia: "2026-07-07" });
      const esperado = rangeDoDiaBrasilia("2026-07-07");
      expect(r.inicio.toISOString()).toBe(esperado.inicio.toISOString());
      expect(r.fimExclusivo.toISOString()).toBe(
        esperado.fimExclusivo.toISOString(),
      );
    });

    it("intervalo é meio-aberto de exatamente 24h", () => {
      const r = parseIntervaloQuery({ dia: "2026-07-07" });
      const horas = (r.fimExclusivo.getTime() - r.inicio.getTime()) / 3_600_000;
      expect(horas).toBe(24);
    });

    it("início é 03:00 UTC (00:00 de Brasília, UTC-3)", () => {
      const r = parseIntervaloQuery({ dia: "2026-07-07" });
      expect(r.inicio.toISOString()).toBe("2026-07-07T03:00:00.000Z");
    });
  });

  describe("modo intervalo", () => {
    it("?inicio&fim → do início do 1º dia ao fim exclusivo do último", () => {
      const r = parseIntervaloQuery({
        inicio: "2026-07-01",
        fim: "2026-07-07",
      });
      expect(r.inicio.toISOString()).toBe(
        rangeDoDiaBrasilia("2026-07-01").inicio.toISOString(),
      );
      expect(r.fimExclusivo.toISOString()).toBe(
        rangeDoDiaBrasilia("2026-07-07").fimExclusivo.toISOString(),
      );
    });

    it("inicio == fim → intervalo de um único dia (24h)", () => {
      const r = parseIntervaloQuery({
        inicio: "2026-07-07",
        fim: "2026-07-07",
      });
      const horas = (r.fimExclusivo.getTime() - r.inicio.getTime()) / 3_600_000;
      expect(horas).toBe(24);
    });
  });

  describe("default sem parâmetro", () => {
    it("query vazia → range de hoje (Brasília)", () => {
      const r = parseIntervaloQuery({});
      const esperado = rangeDoDiaBrasilia(hojeBrasilia());
      expect(r.inicio.toISOString()).toBe(esperado.inicio.toISOString());
      expect(r.fimExclusivo.toISOString()).toBe(
        esperado.fimExclusivo.toISOString(),
      );
    });
  });

  describe("precedência: dia vence inicio/fim (decisão B)", () => {
    it("dia + inicio + fim juntos → usa dia, ignora o resto silenciosamente", () => {
      const r = parseIntervaloQuery({
        dia: "2026-07-07",
        inicio: "2020-01-01",
        fim: "2020-12-31",
      });
      const esperado = rangeDoDiaBrasilia("2026-07-07");
      expect(r.inicio.toISOString()).toBe(esperado.inicio.toISOString());
      expect(r.fimExclusivo.toISOString()).toBe(
        esperado.fimExclusivo.toISOString(),
      );
    });
  });

  describe("validação → AppError 400", () => {
    it("data não-ISO ('banana') lança AppError 400", () => {
      expect(() => parseIntervaloQuery({ dia: "banana" })).toThrow(AppError);
      try {
        parseIntervaloQuery({ dia: "banana" });
      } catch (e) {
        expect((e as AppError).statusCode).toBe(400);
      }
    });

    it("padrão BR invertido ('07-07-2026') é rejeitado", () => {
      expect(() => parseIntervaloQuery({ dia: "07-07-2026" })).toThrow(
        AppError,
      );
    });

    it("data civil impossível ('2026-02-30') é rejeitada", () => {
      expect(() => parseIntervaloQuery({ dia: "2026-02-30" })).toThrow(
        AppError,
      );
    });

    it("sem zero à esquerda ('2026-7-7') é rejeitado", () => {
      expect(() => parseIntervaloQuery({ dia: "2026-7-7" })).toThrow(AppError);
    });

    it("intervalo incompleto (só inicio) lança AppError 400", () => {
      expect(() => parseIntervaloQuery({ inicio: "2026-07-01" })).toThrow(
        AppError,
      );
    });

    it("intervalo incompleto (só fim) lança AppError 400", () => {
      expect(() => parseIntervaloQuery({ fim: "2026-07-07" })).toThrow(
        AppError,
      );
    });

    it("intervalo invertido (fim < inicio) lança AppError 400", () => {
      expect(() =>
        parseIntervaloQuery({ inicio: "2026-07-07", fim: "2026-07-01" }),
      ).toThrow(AppError);
    });

    it("param repetido (array) lança AppError 400", () => {
      expect(() =>
        parseIntervaloQuery({ dia: ["2026-07-07", "2026-07-08"] }),
      ).toThrow(AppError);
    });

    describe("datas civis no retorno", () => {
      it("dia único → diaInicioISO == diaFimISO == dia informado", () => {
        const r = parseIntervaloQuery({ dia: "2026-07-07" });
        expect(r.datas).toEqual({
          diaInicioISO: "2026-07-07",
          diaFimISO: "2026-07-07",
        });
      });

      it("intervalo → datas refletem inicio e fim", () => {
        const r = parseIntervaloQuery({
          inicio: "2026-07-01",
          fim: "2026-07-07",
        });
        expect(r.datas).toEqual({
          diaInicioISO: "2026-07-01",
          diaFimISO: "2026-07-07",
        });
      });

      it("default (sem param) → datas == hoje em Brasília", () => {
        const r = parseIntervaloQuery({});
        const hoje = hojeBrasilia(); // importar de "../datasBrasilia.js" no topo, se ainda não estiver
        expect(r.datas).toEqual({ diaInicioISO: hoje, diaFimISO: hoje });
      });

      it("dia vence inicio/fim → datas ignoram o intervalo", () => {
        const r = parseIntervaloQuery({
          dia: "2026-07-07",
          inicio: "2020-01-01",
          fim: "2020-12-31",
        });
        expect(r.datas).toEqual({
          diaInicioISO: "2026-07-07",
          diaFimISO: "2026-07-07",
        });
      });
    });
  });
});
