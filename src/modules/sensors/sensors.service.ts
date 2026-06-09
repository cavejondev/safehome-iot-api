/**
 * Servicos de cadastro, listagem e desativacao logica dos sensores.
 */
import { CONFLICT, NOT_FOUND } from 'http-status-codes';

import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { assertHouseholdMembership } from '../../shared/utils/access-control';
import { getDeviceStatus } from '../../shared/utils/device-status';

interface CreateSensorInput {
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string;
}

interface UpdateSensorInput {
  name?: string;
  locationLabel?: string | null;
  isActive?: boolean;
}

export class SensorsService {
  public async create(userId: string, householdId: string, input: CreateSensorInput) {
    await assertHouseholdMembership(userId, householdId);

    const gateway = await prisma.gateway.findFirst({
      where: {
        id: input.gatewayId,
        householdId
      }
    });

    if (!gateway) {
      throw new AppError('Gateway nao encontrado para esta residencia', NOT_FOUND);
    }

    const existingSensor = await prisma.sensor.findUnique({
      where: {
        gatewayId_externalId: {
          gatewayId: input.gatewayId,
          externalId: input.externalId
        }
      }
    });

    if (existingSensor) {
      throw new AppError('Ja existe um sensor com este externalId no gateway', CONFLICT);
    }

    return prisma.sensor.create({
      data: {
        householdId,
        gatewayId: input.gatewayId,
        name: input.name,
        externalId: input.externalId,
        locationLabel: input.locationLabel
      }
    });
  }

  public async list(userId: string, householdId: string) {
    await assertHouseholdMembership(userId, householdId);

    const household = await prisma.household.findUnique({
      where: {
        id: householdId
      },
      include: {
        settings: true,
        sensors: {
          include: {
            gateway: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    const sensorCheckInterval =
      household?.settings?.sensorCheckIntervalMinutes ?? env.DEFAULT_SENSOR_CHECK_MINUTES;

    return (household?.sensors ?? []).map((sensor) => ({
      ...sensor,
      status: getDeviceStatus(sensor.isActive, sensor.lastSeenAt, sensorCheckInterval)
    }));
  }

  public async update(userId: string, sensorId: string, input: UpdateSensorInput) {
    const sensor = await prisma.sensor.findUnique({
      where: {
        id: sensorId
      }
    });

    if (!sensor) {
      throw new AppError('Sensor nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, sensor.householdId);

    return prisma.sensor.update({
      where: {
        id: sensorId
      },
      data: {
        ...input
      }
    });
  }

  public async remove(userId: string, sensorId: string) {
    const sensor = await prisma.sensor.findUnique({
      where: {
        id: sensorId
      }
    });

    if (!sensor) {
      throw new AppError('Sensor nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, sensor.householdId);

    return prisma.sensor.update({
      where: {
        id: sensorId
      },
      data: {
        isActive: false
      }
    });
  }
}

export const sensorsService = new SensorsService();
