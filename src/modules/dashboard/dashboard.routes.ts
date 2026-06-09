/**
 * Rota de dashboard resumido para o app.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { dashboardController } from './dashboard.controller';
import { dashboardParamsSchema } from './dashboard.schema';

export const dashboardRouter = Router();

dashboardRouter.use(ensureAuthenticated);

dashboardRouter.get('/:householdId/dashboard', validate(dashboardParamsSchema), (request, response) =>
  dashboardController.get(request, response)
);
