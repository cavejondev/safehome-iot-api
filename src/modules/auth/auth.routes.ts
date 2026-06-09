/**
 * Rotas publicas de autenticacao.
 */
import { Router } from 'express';

import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), (request, response) =>
  authController.register(request, response)
);

authRouter.post('/login', validate(loginSchema), (request, response) =>
  authController.login(request, response)
);
