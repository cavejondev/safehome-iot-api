/**
 * Controller HTTP para logs de atividade.
 */
import type { Request, Response } from 'express';

import { OK } from 'http-status-codes';

import { eventsService } from './events.service';

export class EventsController {
  public async list(request: Request, response: Response): Promise<Response> {
    const events = await eventsService.list(
      request.user!.id,
      String(request.params.householdId),
      request.query as unknown as {
        limit: number;
        from?: string;
        to?: string;
      }
    );

    return response.status(OK).json(events);
  }
}

export const eventsController = new EventsController();
