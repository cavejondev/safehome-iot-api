/**
 * Regras de negocio de cadastro e login do aplicativo mobile.
 */
import { CONFLICT, UNAUTHORIZED } from 'http-status-codes';

import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { comparePassword, hashPassword } from '../../shared/utils/security';
import { signAccessToken } from '../../shared/utils/tokens';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  public async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (existingUser) {
      throw new AppError('Ja existe um usuario com este e-mail', CONFLICT);
    }

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        phone: input.phone
      }
    });

    return {
      token: signAccessToken({
        sub: user.id,
        email: user.email
      }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    };
  }

  public async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw new AppError('Credenciais invalidas', UNAUTHORIZED);
    }

    return {
      token: signAccessToken({
        sub: user.id,
        email: user.email
      }),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    };
  }
}

export const authService = new AuthService();
