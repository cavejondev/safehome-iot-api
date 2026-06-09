/**
 * Controllers HTTP do modulo de alertas.
 */
import type { Request, Response } from 'express';

import { OK } from 'http-status-codes';

import { alertsService } from './alerts.service';

export class AlertsController {
  public async list(request: Request, response: Response): Promise<Response> {
    const alerts = await alertsService.list(request.user!.id, String(request.params.householdId));
    return response.status(OK).json(alerts);
  }

  public async acknowledge(request: Request, response: Response): Promise<Response> {
    const alert = await alertsService.acknowledge(request.user!.id, String(request.params.alertId));
    return response.status(OK).json(alert);
  }

  public async resolve(request: Request, response: Response): Promise<Response> {
    const alert = await alertsService.resolve(request.user!.id, String(request.params.alertId));
    return response.status(OK).json(alert);
  }
}

export const alertsController = new AlertsController();
