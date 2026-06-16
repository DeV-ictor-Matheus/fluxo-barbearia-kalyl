import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-errors.js";

/**
 * Middleware central de tratamento de erro.
 * DEVE ser registrado por último no server.ts, depois de todas as rotas.
 *
 * Regra de segurança: só expõe ao cliente a mensagem de erros que NÓS
 * criamos de propósito (ZodError de validação, AppError de domínio) ou
 * que sabemos traduzir com segurança (Prisma P2025 → 404). Qualquer outro
 * erro vira 500 genérico com a stack logada apenas no servidor.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. Erro de validação Zod → 400 com detalhes dos campos
  if (err instanceof ZodError) {
    res.status(400).json({
      erro: "Dados inválidos",
      detalhes: err.issues,
    });
    return;
  }

  // 2. Erro de domínio que nós lançamos → usa status e mensagem próprios
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: err.message });
    return;
  }

  // 3. Registro não encontrado no Prisma (ex: PATCH/GET de id inexistente) → 404
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({ erro: "Registro não encontrado" });
    return;
  }

  // 4. Qualquer outro erro → inesperado. Loga interno, esconde do cliente.
  console.error("[ERRO NÃO TRATADO]", err);
  res.status(500).json({ erro: "Erro interno do servidor" });
};
