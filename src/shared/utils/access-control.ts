/**
 * Helpers de autorizacao por residencia.
 * Eles garantem que apenas familiares associados a uma casa acessem seus dados.
 */
import { FORBIDDEN } from 'http-status-codes';

import { prisma } from '../../database/prisma';
import { AppError } from '../errors/app-error';

export async function assertHouseholdMembership(userId: string, householdId: string): Promise<void> {
  const membership = await prisma.householdMember.findUnique({
    where: {
      householdId_userId: {
        householdId,
        userId
      }
    }
  });

  if (!membership) {
    throw new AppError('Acesso negado para esta residencia', FORBIDDEN);
  }
}
