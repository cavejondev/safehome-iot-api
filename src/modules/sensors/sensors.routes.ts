/**
 * Rotas autenticadas para gerenciamento de sensores.
 */
import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { sensorsController } from './sensors.controller';
import {
  createSensorSchema,
  deleteSensorSchema,
  listSensorsSchema,
  updateSensorSchema
} from './sensors.schema';

export const sensorsRouter = Router();

sensorsRouter.use(ensureAuthenticated);

sensorsRouter.get('/:householdId/sensors', validate(listSensorsSchema), (request, response) =>
  sensorsController.list(request, response)
);
sensorsRouter.post('/:householdId/sensors', validate(createSensorSchema), (request, response) =>
  sensorsController.create(request, response)
);
sensorsRouter.patch('/sensors/:sensorId', validate(updateSensorSchema), (request, response) =>
  sensorsController.update(request, response)
);
sensorsRouter.delete('/sensors/:sensorId', validate(deleteSensorSchema), (request, response) =>
  sensorsController.remove(request, response)
);
