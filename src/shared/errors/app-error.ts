/**
 * Erro de dominio padronizado para devolver respostas HTTP coerentes.
 * Ele evita espalhar status codes e mensagens por toda a aplicacao.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
