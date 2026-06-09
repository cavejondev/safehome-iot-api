/**
 * Controllers HTTP do modulo de ingestao IoT.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { iotService } from './iot.service';

export class IotController {
  public async recordPresence(request: Request, response: Response): Promise<Response> {
    const event = await iotService.recordPresence(
      request.gateway!.id,
      request.gateway!.householdId,
      request.body
    );

    return response.status(CREATED).json(event);
  }

  public async recordHelpEvent(request: Request, response: Response): Promise<Response> {
    const event = await iotService.recordHelpEvent(
      request.gateway!.id,
      request.gateway!.householdId,
      request.body
    );

    return response.status(CREATED).json(event);
  }

  public async recordHeartbeat(request: Request, response: Response): Promise<Response> {
    const result = await iotService.recordHeartbeat(
      request.gateway!.id,
      request.gateway!.householdId,
      request.body
    );

    return response.status(OK).json(result);
  }
}

export const iotController = new IotController();
