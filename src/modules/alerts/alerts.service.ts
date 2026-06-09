/**
 * Regras de consulta e atualizacao de alertas.
 */
import { AlertStatus } from '@prisma/client';
import { NOT_FOUND } from 'http-status-codes';

import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { assertHouseholdMembership } from '../../shared/utils/access-control';

export class AlertsService {
  public async list(userId: string, householdId: string) {
    await assertHouseholdMembership(userId, householdId);

    return prisma.alert.findMany({
      where: {
        householdId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  public async acknowledge(userId: string, alertId: string) {
    const alert = await prisma.alert.findUnique({
      where: {
        id: alertId
      }
    });

    if (!alert) {
      throw new AppError('Alerta nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, alert.householdId);

    return prisma.alert.update({
      where: {
        id: alertId
      },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
        acknowledgedById: userId
      }
    });
  }

  public async resolve(userId: string, alertId: string) {
    const alert = await prisma.alert.findUnique({
      where: {
        id: alertId
      }
    });

    if (!alert) {
      throw new AppError('Alerta nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, alert.householdId);

    return prisma.alert.update({
      where: {
        id: alertId
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date()
      }
    });
  }
}

export const alertsService = new AlertsService();
