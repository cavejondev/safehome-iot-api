/**
 * Funcoes utilitarias de seguranca para senhas, tokens de gateway e comparacoes.
 */
import { createHash, randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function generatePlainGatewayToken(): string {
  return randomBytes(24).toString('hex');
}

export function hashGatewayToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
