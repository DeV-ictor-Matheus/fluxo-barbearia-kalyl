/**
 * Erro de domínio da camada de transporte.
 * O app inteiro lida com ApiError — nunca com o erro cru do fetch ou do axios.
 * É isto que torna a troca de cliente HTTP uma mudança de um arquivo só.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    // Extrai a mensagem do contrato do backend ({ erro: string }) se existir,
    // senão usa um fallback genérico. Assim a UI lê error.message diretamente.
    const mensagem =
      typeof body === "object" && body !== null && "erro" in body
        ? String((body as { erro: unknown }).erro)
        : `Erro na requisição (status ${status})`;

    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
