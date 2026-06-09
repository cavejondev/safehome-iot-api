/**
 * Rotas autenticadas para gerenciamento dos botoes de ajuda.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { helpButtonsController } from './help-buttons.controller';
import {
  createHelpButtonSchema,
  deleteHelpButtonSchema,
  listHelpButtonsSchema,
  updateHelpButtonSchema
} from './help-buttons.schema';

export const helpButtonsRouter = Router();

helpButtonsRouter.use(ensureAuthenticated);

helpButtonsRouter.get('/:householdId/help-buttons', validate(listHelpButtonsSchema), (request, response) =>
  helpButtonsController.list(request, response)
);
helpButtonsRouter.post('/:householdId/help-buttons', validate(createHelpButtonSchema), (request, response) =>
  helpButtonsController.create(request, response)
);
helpButtonsRouter.patch('/help-buttons/:buttonId', validate(updateHelpButtonSchema), (request, response) =>
  helpButtonsController.update(request, response)
);
helpButtonsRouter.delete('/help-buttons/:buttonId', validate(deleteHelpButtonSchema), (request, response) =>
  helpButtonsController.remove(request, response)
);
