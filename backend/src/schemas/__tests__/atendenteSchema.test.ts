import { describe, expect, it } from "vitest";
import { criarAtendenteSchema } from "../atendenteSchema.js";

describe("criarAtendenteSchema", () => {
  it("aceita um payload válido", () => {
    const resultado = criarAtendenteSchema.parse({
      nome: "Kalyl",
      papel: "dono",
    });

    expect(resultado).toEqual({ nome: "Kalyl", papel: "dono" });
  });

  it("aplica trim no nome", () => {
    const resultado = criarAtendenteSchema.parse({
      nome: "  Igor  ",
      papel: "parceiro1",
    });

    expect(resultado.nome).toBe("Igor");
  });

  it("rejeita nome que fica vazio depois do trim", () => {
    expect(() =>
      criarAtendenteSchema.parse({ nome: "   ", papel: "parceiro2" }),
    ).toThrow();
  });

  it("rejeita nome acima de 20 caracteres", () => {
    expect(() =>
      criarAtendenteSchema.parse({ nome: "a".repeat(21), papel: "dono" }),
    ).toThrow();
  });

  it("rejeita papel fora do enum", () => {
    expect(() =>
      criarAtendenteSchema.parse({ nome: "Lucas", papel: "chefe supremo" }),
    ).toThrow();
  });

  // .strict() é o que impede mass assignment: sem ele, o cliente sobrescreveria
  // campos com default no Prisma (id, ativo) via prisma.create({ data: req.body }).
  it("rejeita campo extra — id não vem do cliente", () => {
    expect(() =>
      criarAtendenteSchema.parse({
        nome: "Kalyl",
        papel: "dono",
        id: "11111111-1111-1111-1111-111111111111",
      }),
    ).toThrow();
  });

  it("rejeita campo extra — ativo não vem do cliente", () => {
    expect(() =>
      criarAtendenteSchema.parse({
        nome: "Igor",
        papel: "parceiro1",
        ativo: false,
      }),
    ).toThrow();
  });
});
