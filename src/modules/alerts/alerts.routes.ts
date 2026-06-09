/**
 * Rotas autenticadas para consultar e tratar alertas.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { alertsController } from './alerts.controller';
import { listAlertsSchema, updateAlertStatusSchema } from './alerts.schema';

export const alertsRouter = Router();

alertsRouter.use(ensureAuthenticated);

alertsRouter.get('/:householdId', validate(listAlertsSchema), (request, response) =>
  alertsController.list(request, response)
);
alertsRouter.patch('/:alertId/acknowledge', validate(updateAlertStatusSchema), (request, response) =>
  alertsController.acknowledge(request, response)
);
alertsRouter.patch('/:alertId/resolve', validate(updateAlertStatusSchema), (request, response) =>
  alertsController.resolve(request, response)
);
