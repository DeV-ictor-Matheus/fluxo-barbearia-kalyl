import { describe, it, expect } from "vitest";
import { montarResumo } from "../resumo.js";

describe("montarResumo", () => {
  it("conta cada barbeiro pela quantidade do grupo correspondente", () => {
    const resumo = montarResumo(
      [
        { atendenteId: "k", quantidade: 5 },
        { atendenteId: "b", quantidade: 3 },
      ],
      [
        { id: "k", nome: "Kalyl" },
        { id: "b", nome: "Bruno" },
      ],
      "2026-06-11",
    );
    expect(resumo.porBarbeiro).toEqual([
      { atendenteId: "k", nome: "Kalyl", quantidade: 5 },
      { atendenteId: "b", nome: "Bruno", quantidade: 3 },
    ]);
  });

  it("preenche 0 para barbeiro ativo que não atendeu (não some do carrossel)", () => {
    const resumo = montarResumo(
      [{ atendenteId: "k", quantidade: 2 }],
      [
        { id: "k", nome: "Kalyl" },
        { id: "b", nome: "Bruno" }, // Bruno não tem grupo
      ],
      "2026-06-11",
    );
    const bruno = resumo.porBarbeiro.find((x) => x.atendenteId === "b");
    expect(bruno).toEqual({ atendenteId: "b", nome: "Bruno", quantidade: 0 });
  });

  it("totalAtendimentos é a soma das contagens dos barbeiros ativos", () => {
    const resumo = montarResumo(
      [
        { atendenteId: "k", quantidade: 5 },
        { atendenteId: "b", quantidade: 3 },
        { atendenteId: "d", quantidade: 4 },
      ],
      [
        { id: "k", nome: "Kalyl" },
        { id: "b", nome: "Bruno" },
        { id: "d", nome: "Diego" },
      ],
      "2026-06-11",
    );
    expect(resumo.totalAtendimentos).toBe(12);
  });

  it("ignora no total a contagem de atendente que NÃO está na lista de ativos", () => {
    const resumo = montarResumo(
      [
        { atendenteId: "k", quantidade: 5 },
        { atendenteId: "inativo", quantidade: 99 },
      ],
      [{ id: "k", nome: "Kalyl" }],
      "2026-06-11",
    );
    expect(resumo.totalAtendimentos).toBe(5);
    expect(resumo.porBarbeiro).toHaveLength(1);
  });

  it("dia sem nenhum atendimento: todos zerados, total 0", () => {
    const resumo = montarResumo(
      [],
      [
        { id: "k", nome: "Kalyl" },
        { id: "b", nome: "Bruno" },
      ],
      "2026-06-11",
    );
    expect(resumo.totalAtendimentos).toBe(0);
    expect(resumo.porBarbeiro.every((b) => b.quantidade === 0)).toBe(true);
  });

  it("ecoa o dia recebido no campo data", () => {
    const resumo = montarResumo([], [], "2026-12-31");
    expect(resumo.data).toBe("2026-12-31");
  });

  it("privacidade por design: nenhuma chave monetária no retorno", () => {
    const resumo = montarResumo(
      [{ atendenteId: "k", quantidade: 5 }],
      [{ id: "k", nome: "Kalyl" }],
      "2026-06-11",
    );
    const json = JSON.stringify(resumo).toLowerCase();
    expect(json).not.toContain("centavos");
    expect(json).not.toContain("valor");
    expect(json).not.toContain("r$");
    expect(Object.keys(resumo.porBarbeiro[0]).sort()).toEqual([
      "atendenteId",
      "nome",
      "quantidade",
    ]);
  });
});
