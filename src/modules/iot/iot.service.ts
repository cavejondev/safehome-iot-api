/**
 * Servicos de ingestao IoT.
 * Os endpoints deste modulo sao a ponte entre Arduino/gateway e o backend.
 */
import { DeviceComponentType, type Prisma } from '@prisma/client';
import { NOT_FOUND } from 'http-status-codes';

import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { parseDateOrNow } from '../../shared/utils/time';
import { monitoringService } from '../monitoring/monitoring.service';

interface PresenceInput {
  sensorExternalId: string;
  detectedAt?: string;
  sourceEventId?: string;
  metadata?: Record<string, unknown>;
}

interface HelpEventInput {
  buttonExternalId: string;
  triggeredAt?: string;
  sourceEventId?: string;
  metadata?: Record<string, unknown>;
}

interface HeartbeatComponentInput {
  externalId: string;
  lastSeenAt?: string;
  metadata?: Record<string, unknown>;
}

interface HeartbeatInput {
  gatewaySeenAt?: string;
  sensors: HeartbeatComponentInput[];
  helpButtons: HeartbeatComponentInput[];
}

export class IotService {
  public async recordPresence(gatewayId: string, householdId: string, input: PresenceInput) {
    const sensor = await prisma.sensor.findFirst({
      where: {
        gatewayId,
        householdId,
        externalId: input.sensorExternalId,
        isActive: true
      }
    });

    if (!sensor) {
      throw new AppError('Sensor nao encontrado para este gateway', NOT_FOUND);
    }

    if (input.sourceEventId) {
      const existingEvent = await prisma.sensorEvent.findUnique({
        where: {
          sensorId_sourceEventId: {
            sensorId: sensor.id,
            sourceEventId: input.sourceEventId
          }
        }
      });

      if (existingEvent) {
        return existingEvent;
      }
    }

    const detectedAt = parseDateOrNow(input.detectedAt);
    const metadata = input.metadata as Prisma.InputJsonValue | undefined;

    const event = await prisma.$transaction(async (tx) => {
      await tx.gateway.update({
        where: {
          id: gatewayId
        },
        data: {
          lastSeenAt: detectedAt
        }
      });

      await tx.sensor.update({
        where: {
          id: sensor.id
        },
        data: {
          lastSeenAt: detectedAt,
          lastTriggeredAt: detectedAt
        }
      });

      await tx.deviceHeartbeat.create({
        data: {
          gatewayId,
          componentType: DeviceComponentType.SENSOR,
          componentId: sensor.id,
          receivedAt: detectedAt,
          metadata
        }
      });

      return tx.sensorEvent.create({
        data: {
          householdId,
          sensorId: sensor.id,
          detectedAt,
          sourceEventId: input.sourceEventId,
          metadata
        }
      });
    });

    await monitoringService.resolveSensorOfflineAlert(householdId, sensor.id);
    await monitoringService.resolveSystemFailureAlert(householdId);
    await monitoringService.resolveInactivityAlert(householdId);

    return event;
  }

  public async recordHelpEvent(gatewayId: string, householdId: string, input: HelpEventInput) {
    const button = await prisma.helpButton.findFirst({
      where: {
        gatewayId,
        householdId,
        externalId: input.buttonExternalId,
        isActive: true
      }
    });

    if (!button) {
      throw new AppError('Botao nao encontrado para este gateway', NOT_FOUND);
    }

    if (input.sourceEventId) {
      const existingEvent = await prisma.helpButtonEvent.findUnique({
        where: {
          helpButtonId_sourceEventId: {
            helpButtonId: button.id,
            sourceEventId: input.sourceEventId
          }
        }
      });

      if (existingEvent) {
        return existingEvent;
      }
    }

    const triggeredAt = parseDateOrNow(input.triggeredAt);
    const metadata = input.metadata as Prisma.InputJsonValue | undefined;

    const event = await prisma.$transaction(async (tx) => {
      await tx.gateway.update({
        where: {
          id: gatewayId
        },
        data: {
          lastSeenAt: triggeredAt
        }
      });

      await tx.helpButton.update({
        where: {
          id: button.id
        },
        data: {
          lastSeenAt: triggeredAt,
          lastPressedAt: triggeredAt
        }
      });

      await tx.deviceHeartbeat.create({
        data: {
          gatewayId,
          componentType: DeviceComponentType.HELP_BUTTON,
          componentId: button.id,
          receivedAt: triggeredAt,
          metadata
        }
      });

      return tx.helpButtonEvent.create({
        data: {
          householdId,
          helpButtonId: button.id,
          triggeredAt,
          sourceEventId: input.sourceEventId,
          metadata
        }
      });
    });

    await monitoringService.createHelpRequestAlert(householdId, button.id, button.name);
    await monitoringService.resolveButtonOfflineAlert(householdId, button.id);
    await monitoringService.resolveSystemFailureAlert(householdId);

    return event;
  }

  public async recordHeartbeat(gatewayId: string, householdId: string, input: HeartbeatInput) {
    const gatewaySeenAt = parseDateOrNow(input.gatewaySeenAt);

    await prisma.gateway.update({
      where: {
        id: gatewayId
      },
      data: {
        lastSeenAt: gatewaySeenAt
      }
    });

    await prisma.deviceHeartbeat.create({
      data: {
        gatewayId,
        componentType: DeviceComponentType.GATEWAY,
        componentId: gatewayId,
        receivedAt: gatewaySeenAt
      }
    });

    const sensors = await prisma.sensor.findMany({
      where: {
        gatewayId,
        householdId,
        externalId: {
          in: input.sensors.map((sensor) => sensor.externalId)
        }
      }
    });

    const helpButtons = await prisma.helpButton.findMany({
      where: {
        gatewayId,
        householdId,
        externalId: {
          in: input.helpButtons.map((button) => button.externalId)
        }
      }
    });

    for (const sensor of sensors) {
      const payload = input.sensors.find((item) => item.externalId === sensor.externalId);
      const receivedAt = parseDateOrNow(payload?.lastSeenAt);

      await prisma.sensor.update({
        where: {
          id: sensor.id
        },
        data: {
          lastSeenAt: receivedAt
        }
      });

      await prisma.deviceHeartbeat.create({
        data: {
          gatewayId,
          componentType: DeviceComponentType.SENSOR,
          componentId: sensor.id,
          receivedAt,
          metadata: payload?.metadata as Prisma.InputJsonValue | undefined
        }
      });

      await monitoringService.resolveSensorOfflineAlert(householdId, sensor.id);
    }

    for (const button of helpButtons) {
      const payload = input.helpButtons.find((item) => item.externalId === button.externalId);
      const receivedAt = parseDateOrNow(payload?.lastSeenAt);

      await prisma.helpButton.update({
        where: {
          id: button.id
        },
        data: {
          lastSeenAt: receivedAt
        }
      });

      await prisma.deviceHeartbeat.create({
        data: {
          gatewayId,
          componentType: DeviceComponentType.HELP_BUTTON,
          componentId: button.id,
          receivedAt,
          metadata: payload?.metadata as Prisma.InputJsonValue | undefined
        }
      });

      await monitoringService.resolveButtonOfflineAlert(householdId, button.id);
    }

    await monitoringService.resolveSystemFailureAlert(householdId);

    const unknownSensors = input.sensors
      .filter((payload) => !sensors.some((sensor) => sensor.externalId === payload.externalId))
      .map((payload) => payload.externalId);
    const unknownButtons = input.helpButtons
      .filter((payload) => !helpButtons.some((button) => button.externalId === payload.externalId))
      .map((payload) => payload.externalId);

    return {
      gatewayId,
      receivedAt: gatewaySeenAt,
      updatedSensors: sensors.length,
      updatedHelpButtons: helpButtons.length,
      ignored: {
        sensors: unknownSensors,
        helpButtons: unknownButtons
      }
    };
  }
}

export const iotService = new IotService();
