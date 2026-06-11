/**
 * Constantes compartilhadas pelo dominio do SafeHome.
 * Aqui ficam limites de plano e nomes usados em calculos e respostas.
 */
import { PlanTier } from '@prisma/client';

export const API_VERSION = '1.0.1';

export const REPORT_RETENTION_DAYS_BY_PLAN: Record<PlanTier, number> = {
  [PlanTier.FREE]: 7,
  [PlanTier.CARE]: 30,
  [PlanTier.PREMIUM]: 90
};

export const SENSOR_STATUS_ONLINE = 'online';
export const SENSOR_STATUS_OFFLINE = 'offline';
