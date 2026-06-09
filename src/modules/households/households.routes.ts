/**
 * Rotas autenticadas relacionadas a residencia e configuracoes principais.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { householdsController } from './households.controller';
import {
  createHouseholdSchema,
  householdIdParamSchema,
  updateHouseholdSettingsSchema
} from './households.schema';

export const householdsRouter = Router();

householdsRouter.use(ensureAuthenticated);

householdsRouter.get('/', (request, response) => householdsController.list(request, response));
householdsRouter.post('/', validate(createHouseholdSchema), (request, response) =>
  householdsController.create(request, response)
);
householdsRouter.get(
  '/:householdId/settings',
  validate(householdIdParamSchema),
  (request, response) => householdsController.getSettings(request, response)
);
householdsRouter.patch(
  '/:householdId/settings',
  validate(updateHouseholdSettingsSchema),
  (request, response) => householdsController.updateSettings(request, response)
);
