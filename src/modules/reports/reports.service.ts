/**
 * Gera relatorios com registros de movimento, alertas e periodos de inatividade.
 */
import { AlertType } from '@prisma/client';

import { prisma } from '../../database/prisma';
import { REPORT_RETENTION_DAYS_BY_PLAN } from '../../shared/constants/system';
import { assertHouseholdMembership } from '../../shared/utils/access-control';
import { clampDateRangeByDays } from '../../shared/utils/time';

export class ReportsService {
  public async generate(userId: string, householdId: string, days: number) {
    await assertHouseholdMembership(userId, householdId);

    const household = await prisma.household.findUniqueOrThrow({
      where: {
        id: householdId
      }
    });

    const retentionDaysAllowed = REPORT_RETENTION_DAYS_BY_PLAN[household.plan];
    const appliedDays = clampDateRangeByDays(days, retentionDaysAllowed);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - appliedDays * 24 * 60 * 60 * 1000);

    const [sensorEvents, helpEvents, alerts] = await Promise.all([
      prisma.sensorEvent.findMany({
        where: {
          householdId,
          detectedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          sensor: true
        },
        orderBy: {
          detectedAt: 'desc'
        }
      }),
      prisma.helpButtonEvent.findMany({
        where: {
          householdId,
          triggeredAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          helpButton: true
        },
        orderBy: {
          triggeredAt: 'desc'
        }
      }),
      prisma.alert.findMany({
        where: {
          householdId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    return {
      household: {
        id: household.id,
        name: household.name,
        plan: household.plan
      },
      period: {
        startDate,
        endDate,
        retentionDaysAllowed,
        appliedDays
      },
      summary: {
        movementEvents: sensorEvents.length,
        helpRequests: helpEvents.length,
        generatedAlerts: alerts.length,
        inactivityAlerts: alerts.filter((alert) => alert.type === AlertType.INACTIVITY).length
      },
      movementEvents: sensorEvents.map((event) => ({
        id: event.id,
        detectedAt: event.detectedAt,
        sensorName: event.sensor.name,
        locationLabel: event.sensor.locationLabel
      })),
      helpEvents: helpEvents.map((event) => ({
        id: event.id,
        triggeredAt: event.triggeredAt,
        buttonName: event.helpButton.name,
        locationLabel: event.helpButton.locationLabel
      })),
      alerts: alerts.map((alert) => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        description: alert.description,
        createdAt: alert.createdAt
      }))
    };
  }
}

export const reportsService = new ReportsService();
