/**
 * Cliente unico do Prisma para acesso ao PostgreSQL.
 * Mantemos uma unica instancia para evitar excesso de conexoes.
 */
import { PrismaClient } from '@prisma/client';

import { env } from '../config/env';

declare global {
  var __safehomePrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__safehomePrisma__ ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
  });

if (env.NODE_ENV !== 'production') {
  global.__safehomePrisma__ = prisma;
}
