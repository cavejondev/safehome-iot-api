/**
 * Servicos ligados ao cadastro da residencia e suas configuracoes centrais.
 */
import { HouseholdRole, type PlanTier } from '@prisma/client';

import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { assertHouseholdMembership } from '../../shared/utils/access-control';

interface CreateHouseholdInput {
  name: string;
  residentName: string;
  addressLabel?: string;
  timezone?: string;
  plan?: PlanTier;
}

interface UpdateSettingsInput {
  inactivityThresholdMinutes?: number;
  sensorCheckIntervalMinutes?: number;
  buttonCheckIntervalMinutes?: number;
  sleepModeStart?: string | null;
  sleepModeEnd?: string | null;
  quietHoursEnabled?: boolean;
}

export class HouseholdsService {
  public async create(userId: string, input: CreateHouseholdInput) {
    return prisma.household.create({
      data: {
        name: input.name,
        residentName: input.residentName,
        addressLabel: input.addressLabel,
        timezone: input.timezone ?? env.APP_TIMEZONE,
        plan: input.plan,
        members: {
          create: {
            userId,
            role: HouseholdRole.OWNER
          }
        },
        settings: {
          create: {
            inactivityThresholdMinutes: env.DEFAULT_INACTIVITY_THRESHOLD_MINUTES,
            sensorCheckIntervalMinutes: env.DEFAULT_SENSOR_CHECK_MINUTES,
            buttonCheckIntervalMinutes: env.DEFAULT_BUTTON_CHECK_MINUTES,
            quietHoursEnabled: false
          }
        }
      },
      include: {
        settings: true
      }
    });
  }

  public async listByUser(userId: string) {
    return prisma.household.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        settings: true,
        _count: {
          select: {
            sensors: true,
            helpButtons: true,
            alerts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  public async getSettings(userId: string, householdId: string) {
    await assertHouseholdMembership(userId, householdId);

    return prisma.householdSettings.findUnique({
      where: {
        householdId
      }
    });
  }

  public async updateSettings(userId: string, householdId: string, input: UpdateSettingsInput) {
    await assertHouseholdMembership(userId, householdId);

    return prisma.householdSettings.update({
      where: {
        householdId
      },
      data: {
        ...input
      }
    });
  }
}

export const householdsService = new HouseholdsService();
