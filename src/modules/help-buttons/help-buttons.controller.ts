/**
 * Controllers HTTP do modulo de botoes de ajuda.
 */
import type { Request, Response } from 'express';

import { CREATED, OK } from 'http-status-codes';

import { helpButtonsService } from './help-buttons.service';

export class HelpButtonsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const button = await helpButtonsService.create(
      request.user!.id,
      String(request.params.householdId),
      request.body
    );

    return response.status(CREATED).json(button);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const buttons = await helpButtonsService.list(request.user!.id, String(request.params.householdId));
    return response.status(OK).json(buttons);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const button = await helpButtonsService.update(
      request.user!.id,
      String(request.params.buttonId),
      request.body
    );
    return response.status(OK).json(button);
  }

  public async remove(request: Request, response: Response): Promise<Response> {
    const button = await helpButtonsService.remove(request.user!.id, String(request.params.buttonId));
    return response.status(OK).json(button);
  }
}

export const helpButtonsController = new HelpButtonsController();
