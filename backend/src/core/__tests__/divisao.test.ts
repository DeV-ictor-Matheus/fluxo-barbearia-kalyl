import { describe, it, expect } from "vitest";
import { calcularDivisao } from "../divisao.js";

describe("calcularDivisao", () => {
  it("dono atende: 100% pra barbearia", () => {
    const resultado = calcularDivisao({
      papel: "dono",
      clienteProprio: false,
      valorServicoCentavos: 7000,
      descontoCentavos: 0,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(7000);
    expect(resultado.valorAtendenteCentavos).toBe(0);
  });

  it("parceiro1: divisão 50/50", () => {
    const resultado = calcularDivisao({
      papel: "parceiro1",
      clienteProprio: false,
      valorServicoCentavos: 7000,
      descontoCentavos: 0,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(3500);
    expect(resultado.valorAtendenteCentavos).toBe(3500);
  });

  it("parceiro2 com cliente próprio: 100% pro parceiro", () => {
    const resultado = calcularDivisao({
      papel: "parceiro2",
      clienteProprio: true,
      valorServicoCentavos: 7000,
      descontoCentavos: 0,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(0);
    expect(resultado.valorAtendenteCentavos).toBe(7000);
  });

  it("gorjeta vai 100% pra quem atendeu, mesmo no 50/50", () => {
    const resultado = calcularDivisao({
      papel: "parceiro1",
      clienteProprio: false,
      valorServicoCentavos: 7000,
      descontoCentavos: 0,
      gorjetaCentavos: 1000,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(3500);
    expect(resultado.valorAtendenteCentavos).toBe(4500); // 3500 + 1000 de gorjeta
  });

  it("centavo ímpar no 50/50: barbearia fica com a sobra, total bate", () => {
    const resultado = calcularDivisao({
      papel: "parceiro1",
      clienteProprio: false,
      valorServicoCentavos: 7001,
      descontoCentavos: 0,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(3501);
    expect(resultado.valorAtendenteCentavos).toBe(3500);
    // o teste que prova que nenhum centavo some:
    expect(
      resultado.valorBarbeariaCentavos + resultado.valorAtendenteCentavos,
    ).toBe(7001);
  });

  it("parceiro2 com walk-in: divisão 50/50 como o parceiro1", () => {
    const resultado = calcularDivisao({
      papel: "parceiro2",
      clienteProprio: false,
      valorServicoCentavos: 7000,
      descontoCentavos: 0,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(3500);
    expect(resultado.valorAtendenteCentavos).toBe(3500);
  });

  it("parceiro1: divisão 50/50 - com desconto", () => {
    const resultado = calcularDivisao({
      papel: "parceiro1",
      clienteProprio: false,
      valorServicoCentavos: 7000,
      descontoCentavos: 1000,
      gorjetaCentavos: 0,
    });
    expect(resultado.valorBarbeariaCentavos).toBe(3000);
    expect(resultado.valorAtendenteCentavos).toBe(3000);
  });
});
