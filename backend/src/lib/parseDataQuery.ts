import { AppError } from "../errors/app-errors.js";

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// Valida o query param ?data opcional. Devolve a string YYYY-MM-DD validada,
// ou undefined se ausente (o service aplica o default = hoje em Brasília).
export function parseDataQuery(data: unknown): string | undefined {
  if (data === undefined) return undefined;

  if (typeof data !== "string" || !FORMATO_DATA.test(data)) {
    throw new AppError("Parâmetro data inválido — use YYYY-MM-DD");
  }

  return data;
}
