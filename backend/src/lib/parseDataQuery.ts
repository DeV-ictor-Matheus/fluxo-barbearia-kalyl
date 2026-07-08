import { validarDataISO } from "./datasBrasilia.js";
import { AppError } from "../errors/app-errors.js";

// Valida o query param ?data opcional. Devolve a string YYYY-MM-DD validada,
// ou undefined se ausente (o service aplica o default = hoje em Brasília).
export function parseDataQuery(data: unknown): string | undefined {
  if (data === undefined) return undefined;
  if (typeof data !== "string") {
    throw new AppError("Parâmetro 'data' deve ser uma string", 400);
  }
  return validarDataISO(data, "data");
}
