import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock do módulo supabase: controlamos o que getSession devolve por teste.
const getSessionMock = vi.fn();
vi.mock("./supabase", () => ({
  supabase: {
    auth: { getSession: () => getSessionMock() },
  },
}));

import { api } from "./api-client";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function okResponse(dados: unknown) {
  return { ok: true, status: 200, json: async () => dados };
}
function errResponse(status: number, dados: unknown) {
  return { ok: false, status, json: async () => dados };
}

function comSessao(token: string) {
  getSessionMock.mockResolvedValue({
    data: { session: { access_token: token } },
  });
}
function semSessao() {
  getSessionMock.mockResolvedValue({ data: { session: null } });
}

beforeEach(() => {
  fetchMock.mockReset();
  getSessionMock.mockReset();
  semSessao();
});

describe("api-client — injeção de token", () => {
  it("com sessão: injeta Authorization Bearer", async () => {
    comSessao("tok123");
    fetchMock.mockResolvedValue(okResponse({ ok: true }));

    await api.get("/relatorio");

    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers["Authorization"]).toBe("Bearer tok123");
  });

  it("sem sessão: NÃO injeta Authorization", async () => {
    fetchMock.mockResolvedValue(okResponse({ ok: true }));

    await api.get("/relatorio");

    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers["Authorization"]).toBeUndefined();
  });

  it("GET sem body: não adiciona Content-Type", async () => {
    fetchMock.mockResolvedValue(okResponse({ ok: true }));
    await api.get("/relatorio");
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers["Content-Type"]).toBeUndefined();
  });

  it("POST com body: mantém Content-Type e injeta token juntos", async () => {
    comSessao("tok123");
    fetchMock.mockResolvedValue(okResponse({ ok: true }));
    await api.post("/entradas", { a: 1 });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.headers["Authorization"]).toBe("Bearer tok123");
    expect(opts.body).toBe('{"a":1}');
  });

  it("401: sobe como ApiError sem retry", async () => {
    comSessao("expirado");
    fetchMock.mockResolvedValue(
      errResponse(401, { erro: "Sessão inválida ou expirada" }),
    );
    await expect(api.get("/relatorio")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
