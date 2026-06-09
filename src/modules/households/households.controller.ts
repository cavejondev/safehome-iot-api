/**
 * Controllers HTTP de residencia.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { householdsService } from './households.service';

export class HouseholdsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const household = await householdsService.create(request.user!.id, request.body);
    return response.status(CREATED).json(household);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const households = await householdsService.listByUser(request.user!.id);
    return response.status(OK).json(households);
  }

  public async getSettings(request: Request, response: Response): Promise<Response> {
    const settings = await householdsService.getSettings(
      request.user!.id,
      String(request.params.householdId)
    );
    return response.status(OK).json(settings);
  }

  public async updateSettings(request: Request, response: Response): Promise<Response> {
    const settings = await householdsService.updateSettings(
      request.user!.id,
      String(request.params.householdId),
      request.body
    );

    return response.status(OK).json(settings);
  }
}

export const householdsController = new HouseholdsController();
