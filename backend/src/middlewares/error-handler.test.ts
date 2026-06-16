import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-errors.js";
import { errorHandler } from "./error-handler.js";

/**
 * Cria um objeto Response "falso" para testar o handler isoladamente.
 * res.status() retorna o próprio res para permitir o encadeamento
 * res.status(...).json(...) que o handler usa.
 */
function criarResponseFake() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// O handler exige (err, req, res, next), mas só usa err e res.
// req e next podem ser stubs vazios.
const reqFake = {} as Request;
const nextFake = vi.fn();

describe("errorHandler", () => {
  beforeEach(() => {
    // Limpa o histórico das funções espiãs entre testes para
    // evitar que asserções de um teste vazem para o outro.
    vi.clearAllMocks();
    // Silencia o console.error do caso genérico (evita poluir a saída
    // do teste com a stack que o handler loga de propósito).
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("ZodError → 400 com erro e detalhes", () => {
    const erro = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        path: ["atendenteId"],
        message: "atendenteId é obrigatório",
      },
    ]);
    const res = criarResponseFake();

    errorHandler(erro, reqFake, res, nextFake);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Dados inválidos",
      detalhes: erro.issues,
    });
  });

  it("AppError → usa o statusCode e a mensagem próprios (400 padrão)", () => {
    const erro = new AppError("Desconto acima do permitido.");
    const res = criarResponseFake();

    errorHandler(erro, reqFake, res, nextFake);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Desconto acima do permitido.",
    });
  });

  it("AppError → respeita statusCode customizado (404)", () => {
    const erro = new AppError("Atendente não encontrado.", 404);
    const res = criarResponseFake();

    errorHandler(erro, reqFake, res, nextFake);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Atendente não encontrado.",
    });
  });

  it("Prisma P2025 → 404 com mensagem genérica", () => {
    const erro = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "7.8.0",
    });
    const res = criarResponseFake();

    errorHandler(erro, reqFake, res, nextFake);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: "Registro não encontrado" });
  });

  it("Error genérico → 500 e NÃO vaza a mensagem interna", () => {
    const erro = new Error(
      "Invalid prisma.servico.create() invocation in D:\\Barbearia Kalyl\\...",
    );
    const res = criarResponseFake();

    errorHandler(erro, reqFake, res, nextFake);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: "Erro interno do servidor" });

    // Asserção de segurança: a mensagem original (com caminho de disco)
    // jamais pode aparecer no corpo da resposta enviada ao cliente.
    const corpoEnviado = JSON.stringify(
      (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0],
    );
    expect(corpoEnviado).not.toContain("Barbearia Kalyl");
    expect(corpoEnviado).not.toContain("prisma.servico.create");
  });
});
