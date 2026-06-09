/**
 * Traduz excecoes para respostas HTTP padronizadas e registra erros inesperados.
 */
import type { NextFunction, Request, Response } from 'express';

import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { ZodError } from 'zod';

import { logger } from '../config/logger';
import { AppError } from '../shared/errors/app-error';

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
): Response {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
      path: request.path
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Dados invalidos na requisicao',
      details: error.flatten(),
      path: request.path
    });
  }

  logger.error({ error }, 'Erro nao tratado durante a requisicao');

  return response.status(INTERNAL_SERVER_ERROR).json({
    message: 'Erro interno do servidor',
    path: request.path
  });
}
