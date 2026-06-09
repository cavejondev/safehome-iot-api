/**
 * Ponto central das rotas HTTP do projeto.
 * Mantemos o agrupamento aqui para facilitar versionamento e organizacao da API.
 */
import { Router } from 'express';

import { alertsRouter } from '../modules/alerts/alerts.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { eventsRouter } from '../modules/events/events.routes';
import { gatewaysRouter } from '../modules/gateways/gateways.routes';
import { householdsRouter } from '../modules/households/households.routes';
import { iotRouter } from '../modules/iot/iot.routes';
import { reportsRouter } from '../modules/reports/reports.routes';
import { helpButtonsRouter } from '../modules/help-buttons/help-buttons.routes';
import { sensorsRouter } from '../modules/sensors/sensors.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.status(200).json({
    name: 'safehome-api',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/households', householdsRouter);
apiRouter.use('/households', gatewaysRouter);
apiRouter.use('/households', sensorsRouter);
apiRouter.use('/households', helpButtonsRouter);
apiRouter.use('/households', dashboardRouter);
apiRouter.use('/households', eventsRouter);
apiRouter.use('/households', reportsRouter);
apiRouter.use('/alerts', alertsRouter);
apiRouter.use('/iot', iotRouter);
