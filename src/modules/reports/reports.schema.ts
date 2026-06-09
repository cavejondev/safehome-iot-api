/**
 * Schemas do gerador de relatorios.
 */
import { z } from 'zod';

export const reportsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  }),
  query: z.object({
    days: z.coerce.number().int().positive().max(365).default(7)
  })
};
