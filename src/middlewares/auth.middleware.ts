/**
 * Middleware de autenticacao JWT para rotas consumidas pelo app mobile.
 */
import type { NextFunction, Request, Response } from 'express';

import { UNAUTHORIZED } from 'http-status-codes';

import { AppError } from '../shared/errors/app-error';
import { verifyAccessToken } from '../shared/utils/tokens';

export function ensureAuthenticated(
  request: Request,
  _response: Response,
  next: NextFunction
): void {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    next(new AppError('Token de acesso nao informado', UNAUTHORIZED));
    return;
  }

  const token = authorizationHeader.replace('Bearer ', '');
  try {
    const payload = verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email
    };

    next();
  } catch {
    next(new AppError('Token invalido ou expirado', UNAUTHORIZED));
  }
}
