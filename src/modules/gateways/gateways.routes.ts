/**
 * Rotas autenticadas para gerenciamento do gateway central.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { gatewaysController } from './gateways.controller';
import {
  createGatewaySchema,
  listGatewaysSchema,
  rotateGatewayTokenSchema
} from './gateways.schema';

export const gatewaysRouter = Router();

gatewaysRouter.use(ensureAuthenticated);

gatewaysRouter.get('/:householdId/gateways', validate(listGatewaysSchema), (request, response) =>
  gatewaysController.list(request, response)
);
gatewaysRouter.post('/:householdId/gateways', validate(createGatewaySchema), (request, response) =>
  gatewaysController.create(request, response)
);
gatewaysRouter.post('/gateways/:gatewayId/rotate-token', validate(rotateGatewayTokenSchema), (request, response) =>
  gatewaysController.rotateToken(request, response)
);
