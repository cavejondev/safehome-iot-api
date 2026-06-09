/**
 * Controllers HTTP do modulo de autenticacao.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { authService } from './auth.service';

export class AuthController {
  public async register(request: Request, response: Response): Promise<Response> {
    const result = await authService.register(request.body);
    return response.status(CREATED).json(result);
  }

  public async login(request: Request, response: Response): Promise<Response> {
    const result = await authService.login(request.body);
    return response.status(OK).json(result);
  }
}

export const authController = new AuthController();
