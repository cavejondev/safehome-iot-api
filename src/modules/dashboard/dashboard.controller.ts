/**
 * Controller HTTP do dashboard principal.
 */
import type { Request, Response } from 'express';

import { OK } from 'http-status-codes';

import { dashboardService } from './dashboard.service';

export class DashboardController {
  public async get(request: Request, response: Response): Promise<Response> {
    const dashboard = await dashboardService.get(request.user!.id, String(request.params.householdId));
    return response.status(OK).json(dashboard);
  }
}

export const dashboardController = new DashboardController();
