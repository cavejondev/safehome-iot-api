/**
 * Schemas para consulta de logs e historico.
 */
import { z } from 'zod';

export const listEventsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  }),
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    from: z.string().optional(),
    to: z.string().optional()
  })
};
