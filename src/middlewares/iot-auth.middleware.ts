/**
 * Middleware dedicado aos dispositivos IoT.
 * O gateway envia um token proprio no header para autenticar leituras e heartbeats.
 */
import type { NextFunction, Request, Response } from 'express';

import { UNAUTHORIZED } from 'http-status-codes';

import { prisma } from '../database/prisma';
import { AppError } from '../shared/errors/app-error';
import { hashGatewayToken } from '../shared/utils/security';

export async function ensureGatewayAuthenticated(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  const token = request.header('x-gateway-token');

  if (!token) {
    next(new AppError('Header x-gateway-token e obrigatorio', UNAUTHORIZED));
    return;
  }

  const gateway = await prisma.gateway.findFirst({
    where: {
      tokenHash: hashGatewayToken(token),
      isActive: true
    }
  });

  if (!gateway) {
    next(new AppError('Gateway nao autorizado', UNAUTHORIZED));
    return;
  }

  request.gateway = {
    id: gateway.id,
    householdId: gateway.householdId,
    serialNumber: gateway.serialNumber
  };

  next();
}
