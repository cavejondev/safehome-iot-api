/**
 * Responsavel por assinar e validar tokens JWT usados pelo app mobile.
 */
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

  return {
    sub: String(decoded.sub),
    email: String(decoded.email)
  };
}
