import type { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { AppError } from "../errors/app-errors.js";

// URL do projeto Supabase — necessária para montar o endpoint JWKS.
const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL ausente no .env — necessário para validar o acesso ao relatório",
  );
}

// Conjunto de chaves públicas (JWKS) do projeto. O jose busca as chaves
// assimétricas (ES256) neste endpoint e mantém um cache com rotação automática.
const JWKS = createRemoteJWKSet(
  new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
);

// Porteiro das rotas do dono. Exige um JWT válido do Supabase no header
// Authorization. Como o cadastro público está desligado, o único usuário
// possível é o dono — token válido = acesso do dono liberado.
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Acesso não autorizado", 401);
  }

  const token = header.substring("Bearer ".length);

  try {
    await jwtVerify(token, JWKS, {
      issuer: `${supabaseUrl}/auth/v1`,
      // audience: "authenticated", // habilite se quiser validar o claim aud
    });
    next();
  } catch {
    throw new AppError("Sessão inválida ou expirada", 401);
  }
}
