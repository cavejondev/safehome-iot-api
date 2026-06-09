/**
 * Controllers HTTP do gateway.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { gatewaysService } from './gateways.service';

export class GatewaysController {
  public async create(request: Request, response: Response): Promise<Response> {
    const result = await gatewaysService.create(
      request.user!.id,
      String(request.params.householdId),
      request.body
    );

    return response.status(CREATED).json(result);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const result = await gatewaysService.list(request.user!.id, String(request.params.householdId));
    return response.status(OK).json(result);
  }

  public async rotateToken(request: Request, response: Response): Promise<Response> {
    const result = await gatewaysService.rotateToken(request.user!.id, String(request.params.gatewayId));
    return response.status(OK).json(result);
  }
}

export const gatewaysController = new GatewaysController();
