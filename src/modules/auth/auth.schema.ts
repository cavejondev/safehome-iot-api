/**
 * Schemas de entrada do modulo de autenticacao.
 */
import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(8).optional()
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
};
