/**
 * Rotas autenticadas de historico.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { eventsController } from './events.controller';
import { listEventsSchema } from './events.schema';

export const eventsRouter = Router();

eventsRouter.use(ensureAuthenticated);

eventsRouter.get('/:householdId/events', validate(listEventsSchema), (request, response) =>
  eventsController.list(request, response)
);
