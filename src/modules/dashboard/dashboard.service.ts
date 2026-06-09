/**
 * Monta a visao consolidada do app: status, ultimas atividades e alertas.
 */
import { AlertStatus } from '@prisma/client';

import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { assertHouseholdMembership } from '../../shared/utils/access-control';
import { getDeviceStatus } from '../../shared/utils/device-status';
import { formatElapsedMinutes } from '../../shared/utils/time';

export class DashboardService {
  public async get(userId: string, householdId: string) {
    await assertHouseholdMembership(userId, householdId);

    const household = await prisma.household.findUnique({
      where: {
        id: householdId
      },
      include: {
        settings: true,
        gateways: true,
        sensors: true,
        helpButtons: true,
        alerts: {
          where: {
            status: {
              in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED]
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        sensorEvents: {
          include: {
            sensor: true
          },
          orderBy: {
            detectedAt: 'desc'
          },
          take: 10
        },
        helpEvents: {
          include: {
            helpButton: true
          },
          orderBy: {
            triggeredAt: 'desc'
          },
          take: 10
        }
      }
    });

    const sensorCheckInterval =
      household?.settings?.sensorCheckIntervalMinutes ?? env.DEFAULT_SENSOR_CHECK_MINUTES;
    const buttonCheckInterval =
      household?.settings?.buttonCheckIntervalMinutes ?? env.DEFAULT_BUTTON_CHECK_MINUTES;
    const lastActivityAt = household?.sensors
      .map((sensor) => sensor.lastTriggeredAt)
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
    const lastButtonCheckAt = household?.helpButtons
      .map((button) => button.lastSeenAt)
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

    const latestEvents = [
      ...(household?.sensorEvents ?? []).map((event) => ({
        id: event.id,
        type: 'presence',
        occurredAt: event.detectedAt,
        label: event.sensor.name
      })),
      ...(household?.helpEvents ?? []).map((event) => ({
        id: event.id,
        type: 'help',
        occurredAt: event.triggeredAt,
        label: event.helpButton.name
      }))
    ]
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
      .slice(0, 10);

    return {
      household: household
        ? {
            id: household.id,
            name: household.name,
            residentName: household.residentName,
            plan: household.plan,
            timezone: household.timezone
          }
        : null,
      lastActivityAt,
      minutesSinceLastActivity: formatElapsedMinutes(lastActivityAt),
      lastButtonCheckAt,
      openAlerts: household?.alerts ?? [],
      sensors: (household?.sensors ?? []).map((sensor) => ({
        id: sensor.id,
        name: sensor.name,
        externalId: sensor.externalId,
        locationLabel: sensor.locationLabel,
        status: getDeviceStatus(sensor.isActive, sensor.lastSeenAt, sensorCheckInterval),
        lastSeenAt: sensor.lastSeenAt,
        lastTriggeredAt: sensor.lastTriggeredAt
      })),
      helpButtons: (household?.helpButtons ?? []).map((button) => ({
        id: button.id,
        name: button.name,
        externalId: button.externalId,
        locationLabel: button.locationLabel,
        status: getDeviceStatus(button.isActive, button.lastSeenAt, buttonCheckInterval),
        lastSeenAt: button.lastSeenAt,
        lastPressedAt: button.lastPressedAt
      })),
      gateways: (household?.gateways ?? []).map((gateway) => ({
        id: gateway.id,
        name: gateway.name,
        serialNumber: gateway.serialNumber,
        firmwareVersion: gateway.firmwareVersion,
        status: getDeviceStatus(gateway.isActive, gateway.lastSeenAt, sensorCheckInterval),
        lastSeenAt: gateway.lastSeenAt
      })),
      latestEvents
    };
  }
}

export const dashboardService = new DashboardService();
