/**
 * Schemas do modulo de alertas.
 */
import { z } from 'zod';

export const listAlertsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};

export const updateAlertStatusSchema = {
  params: z.object({
    alertId: z.string().min(1)
  })
};
