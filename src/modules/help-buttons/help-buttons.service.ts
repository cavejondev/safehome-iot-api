/**
 * Servicos de cadastro e administracao dos botoes de ajuda.
 */
import { CONFLICT, NOT_FOUND } from 'http-status-codes';

import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { assertHouseholdMembership } from '../../shared/utils/access-control';
import { getDeviceStatus } from '../../shared/utils/device-status';

interface CreateHelpButtonInput {
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string;
}

interface UpdateHelpButtonInput {
  name?: string;
  locationLabel?: string | null;
  isActive?: boolean;
}

export class HelpButtonsService {
  public async create(userId: string, householdId: string, input: CreateHelpButtonInput) {
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

    const existingButton = await prisma.helpButton.findUnique({
      where: {
        gatewayId_externalId: {
          gatewayId: input.gatewayId,
          externalId: input.externalId
        }
      }
    });

    if (existingButton) {
      throw new AppError('Ja existe um botao com este externalId no gateway', CONFLICT);
    }

    return prisma.helpButton.create({
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
        helpButtons: {
          include: {
            gateway: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    const buttonCheckInterval =
      household?.settings?.buttonCheckIntervalMinutes ?? env.DEFAULT_BUTTON_CHECK_MINUTES;

    return (household?.helpButtons ?? []).map((button) => ({
      ...button,
      status: getDeviceStatus(button.isActive, button.lastSeenAt, buttonCheckInterval)
    }));
  }

  public async update(userId: string, buttonId: string, input: UpdateHelpButtonInput) {
    const button = await prisma.helpButton.findUnique({
      where: {
        id: buttonId
      }
    });

    if (!button) {
      throw new AppError('Botao nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, button.householdId);

    return prisma.helpButton.update({
      where: {
        id: buttonId
      },
      data: {
        ...input
      }
    });
  }

  public async remove(userId: string, buttonId: string) {
    const button = await prisma.helpButton.findUnique({
      where: {
        id: buttonId
      }
    });

    if (!button) {
      throw new AppError('Botao nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, button.householdId);

    return prisma.helpButton.update({
      where: {
        id: buttonId
      },
      data: {
        isActive: false
      }
    });
  }
}

export const helpButtonsService = new HelpButtonsService();
