/**
 * Controller HTTP do modulo de relatorios.
 */
import type { Request, Response } from 'express';

import { OK } from 'http-status-codes';

import { reportsService } from './reports.service';

export class ReportsController {
  public async generate(request: Request, response: Response): Promise<Response> {
    const report = await reportsService.generate(
      request.user!.id,
      String(request.params.householdId),
      Number(request.query.days)
    );

    return response.status(OK).json(report);
  }
}

export const reportsController = new ReportsController();
