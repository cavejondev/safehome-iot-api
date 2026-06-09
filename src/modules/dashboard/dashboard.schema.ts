/**
 * Schema do dashboard resumido consumido pelo app mobile.
 */
import { z } from 'zod';

export const dashboardParamsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};
