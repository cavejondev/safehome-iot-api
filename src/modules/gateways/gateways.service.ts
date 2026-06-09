/**
 * Servicos do gateway IoT, incluindo geracao e rotacao de token seguro.
 */
import { CONFLICT, NOT_FOUND } from 'http-status-codes';

import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { assertHouseholdMembership } from '../../shared/utils/access-control';
import { generatePlainGatewayToken, hashGatewayToken } from '../../shared/utils/security';

interface CreateGatewayInput {
  name: string;
  serialNumber: string;
  firmwareVersion?: string;
}

export class GatewaysService {
  public async create(userId: string, householdId: string, input: CreateGatewayInput) {
    await assertHouseholdMembership(userId, householdId);

    const existingGateway = await prisma.gateway.findUnique({
      where: {
        serialNumber: input.serialNumber
      }
    });

    if (existingGateway) {
      throw new AppError('Ja existe um gateway com este serial', CONFLICT);
    }

    const gatewayToken = generatePlainGatewayToken();

    const gateway = await prisma.gateway.create({
      data: {
        householdId,
        name: input.name,
        serialNumber: input.serialNumber,
        firmwareVersion: input.firmwareVersion,
        tokenHash: hashGatewayToken(gatewayToken)
      }
    });

    return {
      gateway,
      gatewayToken
    };
  }

  public async list(userId: string, householdId: string) {
    await assertHouseholdMembership(userId, householdId);

    return prisma.gateway.findMany({
      where: {
        householdId
      },
      include: {
        _count: {
          select: {
            sensors: true,
            helpButtons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  public async rotateToken(userId: string, gatewayId: string) {
    const gateway = await prisma.gateway.findUnique({
      where: {
        id: gatewayId
      }
    });

    if (!gateway) {
      throw new AppError('Gateway nao encontrado', NOT_FOUND);
    }

    await assertHouseholdMembership(userId, gateway.householdId);

    const gatewayToken = generatePlainGatewayToken();

    const updatedGateway = await prisma.gateway.update({
      where: {
        id: gatewayId
      },
      data: {
        tokenHash: hashGatewayToken(gatewayToken)
      }
    });

    return {
      gateway: updatedGateway,
      gatewayToken
    };
  }
}

export const gatewaysService = new GatewaysService();
