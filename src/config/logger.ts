/**
 * Logger principal da API.
 * Em producao ele gera JSON estruturado; em desenvolvimento continua simples de inspecionar.
 */
import pino from 'pino';

import { env } from './env';

export const logger = pino({
  name: 'safehome-api',
  level: env.NODE_ENV === 'production' ? 'info' : 'debug'
});
