/**
 * Schemas do modulo de botoes fisicos de ajuda.
 */
import { z } from 'zod';

export const createHelpButtonSchema = {
  params: z.object({
    householdId: z.string().min(1)
  }),
  body: z.object({
    gatewayId: z.string().min(1),
    name: z.string().min(3),
    externalId: z.string().min(2),
    locationLabel: z.string().optional()
  })
};

export const listHelpButtonsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};

export const updateHelpButtonSchema = {
  params: z.object({
    buttonId: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    locationLabel: z.string().nullable().optional(),
    isActive: z.boolean().optional()
  })
};

export const deleteHelpButtonSchema = {
  params: z.object({
    buttonId: z.string().min(1)
  })
};
