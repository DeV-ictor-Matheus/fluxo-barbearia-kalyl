import { describe, it, expect } from "vitest";
import { encontrarLider } from "./encontrar-lider";

const b = (atendenteId: string, quantidade: number) => ({
  atendenteId,
  nome: atendenteId,
  quantidade,
});

describe("encontrarLider", () => {
  it("coroa o barbeiro com estritamente mais entradas", () => {
    const resultado = encontrarLider([
      b("kalyl", 8),
      b("igor", 5),
      b("lucas", 3),
    ]);
    expect(resultado).toBe("kalyl");
  });

  it("não coroa ninguém quando há empate no topo entre dois", () => {
    const resultado = encontrarLider([
      b("kalyl", 6),
      b("igor", 6),
      b("lucas", 2),
    ]);
    expect(resultado).toBeNull();
  });

  it("não coroa ninguém no início do dia com todos zerados", () => {
    const resultado = encontrarLider([
      b("kalyl", 0),
      b("igor", 0),
      b("lucas", 0),
    ]);
    expect(resultado).toBeNull();
  });

  it("ignora empate fora do topo e coroa o líder isolado", () => {
    const resultado = encontrarLider([
      b("kalyl", 9),
      b("igor", 4),
      b("lucas", 4),
    ]);
    expect(resultado).toBe("kalyl");
  });

  it("coroa o único barbeiro com entradas quando os outros estão zerados", () => {
    const resultado = encontrarLider([
      b("kalyl", 3),
      b("igor", 0),
      b("lucas", 0),
    ]);
    expect(resultado).toBe("kalyl");
  });

  it("retorna null para lista vazia", () => {
    expect(encontrarLider([])).toBeNull();
  });
});
