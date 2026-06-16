import { ApiError } from "./api-error";

// Em dev, "/api" é interceptado pelo proxy do Vite → backend :3333.
// Em prod, VITE_API_URL aponta para o backend publicado (com /api se aplicável).
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Wrapper único sobre o fetch — a ÚNICA fronteira entre o app e o backend.
 * Nenhum outro arquivo deve chamar fetch diretamente. Isto garante que:
 *  - todo retorno chega parseado e tipado (Promise<T>), nunca Response cru;
 *  - todo erro vira ApiError, com a mensagem já extraída do contrato { erro };
 *  - trocar fetch por axios no futuro é mudança de um arquivo só.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Tenta parsear o corpo como JSON. Respostas de erro do backend também
  // são JSON ({ erro, detalhes? }); um corpo vazio ou não-JSON vira null.
  const dados = await res.json().catch(() => null);

  // CRÍTICO: o fetch NÃO rejeita em 4xx/5xx. Sem este check, o React Query
  // trataria um erro HTTP como sucesso. Aqui transformamos em ApiError.
  if (!res.ok) {
    throw new ApiError(res.status, dados);
  }

  return dados as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
};
