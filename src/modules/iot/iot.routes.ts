/**
 * Rotas consumidas pelo gateway/Arduino.
 */
import { Router } from 'express';

import { ensureGatewayAuthenticated } from '../../middlewares/iot-auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { iotController } from './iot.controller';
import {
  recordHeartbeatSchema,
  recordHelpEventSchema,
  recordPresenceSchema
} from './iot.schema';

export const iotRouter = Router();

iotRouter.use(ensureGatewayAuthenticated);

iotRouter.post('/presence-events', validate(recordPresenceSchema), (request, response) =>
  iotController.recordPresence(request, response)
);
iotRouter.post('/help-events', validate(recordHelpEventSchema), (request, response) =>
  iotController.recordHelpEvent(request, response)
);
iotRouter.post('/heartbeats', validate(recordHeartbeatSchema), (request, response) =>
  iotController.recordHeartbeat(request, response)
);
