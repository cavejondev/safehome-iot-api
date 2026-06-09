/**
 * Controllers HTTP do modulo de sensores.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { sensorsService } from './sensors.service';

export class SensorsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const sensor = await sensorsService.create(
      request.user!.id,
      String(request.params.householdId),
      request.body
    );

    return response.status(CREATED).json(sensor);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const sensors = await sensorsService.list(request.user!.id, String(request.params.householdId));
    return response.status(OK).json(sensors);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const sensor = await sensorsService.update(
      request.user!.id,
      String(request.params.sensorId),
      request.body
    );
    return response.status(OK).json(sensor);
  }

  public async remove(request: Request, response: Response): Promise<Response> {
    const sensor = await sensorsService.remove(request.user!.id, String(request.params.sensorId));
    return response.status(OK).json(sensor);
  }
}

export const sensorsController = new SensorsController();
