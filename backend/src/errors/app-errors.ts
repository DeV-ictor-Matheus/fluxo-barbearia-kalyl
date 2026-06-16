/**
 * Erro de domínio / negócio — esperado e seguro para exibir ao cliente.
 * Distingue uma regra de negócio violada (ex: desconto > 50%) de um
 * erro acidental (bug, falha de infra). O error handler central só
 * confia na mensagem de erros deste tipo; qualquer outro vira 500 genérico.
 */
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
