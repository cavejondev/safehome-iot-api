/**
 * Centraliza e valida as variaveis de ambiente antes da aplicacao subir.
 * Assim falhas de configuracao aparecem cedo e de forma previsivel.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  APP_TIMEZONE: z.string().default('America/Sao_Paulo'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL e obrigatoria'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  MONITORING_ENABLED: z
    .string()
    .default('true')
    .transform((value) => value === 'true'),
  MONITORING_CRON: z.string().default('*/5 * * * *'),
  DEFAULT_SENSOR_CHECK_MINUTES: z.coerce.number().int().positive().default(30),
  DEFAULT_BUTTON_CHECK_MINUTES: z.coerce.number().int().positive().default(10),
  DEFAULT_INACTIVITY_THRESHOLD_MINUTES: z.coerce.number().int().positive().default(120)
});

export const env = envSchema.parse(process.env);
