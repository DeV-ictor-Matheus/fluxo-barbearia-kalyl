import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// jose é mockado ANTES de qualquer import do middleware. Sem isso,
// createRemoteJWKSet tentaria buscar chaves na URL dummy (rede).
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "jwks-falso"),
  jwtVerify: vi.fn(),
}));

// O requireAuth lê SUPABASE_URL no import (throw se ausente) e monta o
// JWKS no topo do módulo. Por isso: env primeiro, import dinâmico depois.
process.env.SUPABASE_URL = "https://dummy.supabase.co";

const { requireAuth } = await import("../requireAuth.js");
const { jwtVerify } = await import("jose");
const { AppError } = await import("../../errors/app-errors.js");

function criarReq(authorization?: string) {
  return { headers: authorization ? { authorization } : {} } as Request;
}

const res = {} as Response;

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita requisição sem header Authorization", async () => {
    const next = vi.fn() as NextFunction;

    await expect(requireAuth(criarReq(), res, next)).rejects.toMatchObject({
      statusCode: 401,
      message: "Acesso não autorizado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita header sem o prefixo Bearer", async () => {
    const next = vi.fn() as NextFunction;

    await expect(
      requireAuth(criarReq("token-solto"), res, next),
    ).rejects.toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita token que o jose considera inválido ou expirado", async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(
      new Error("assinatura inválida"),
    );
    const next = vi.fn() as NextFunction;

    await expect(
      requireAuth(criarReq("Bearer token-podre"), res, next),
    ).rejects.toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it("libera a passagem quando o token é válido", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({} as never);
    const next = vi.fn() as NextFunction;

    await requireAuth(criarReq("Bearer token-bom"), res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejeita header sem o prefixo Bearer", async () => {
    const next = vi.fn() as NextFunction;

    await expect(
      requireAuth(criarReq("token-solto"), res, next),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Acesso não autorizado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita token que o jose considera inválido ou expirado", async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(
      new Error("assinatura inválida"),
    );
    const next = vi.fn() as NextFunction;

    await expect(
      requireAuth(criarReq("Bearer token-podre"), res, next),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Sessão inválida ou expirada",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("libera a passagem quando o token é válido", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({} as never);
    const next = vi.fn() as NextFunction;

    await requireAuth(criarReq("Bearer token-bom"), res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
