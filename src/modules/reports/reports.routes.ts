/**
 * Rotas autenticadas para geracao de relatorios.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { reportsController } from './reports.controller';
import { reportsSchema } from './reports.schema';

export const reportsRouter = Router();

reportsRouter.use(ensureAuthenticated);

reportsRouter.get('/:householdId/reports/activity', validate(reportsSchema), (request, response) =>
  reportsController.generate(request, response)
);
