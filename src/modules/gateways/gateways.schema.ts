/**
 * Schemas do gateway central que representa o Arduino/controlador principal.
 */
import { z } from 'zod';

export const createGatewaySchema = {
  params: z.object({
    householdId: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(3),
    serialNumber: z.string().min(3),
    firmwareVersion: z.string().optional()
  })
};

export const listGatewaysSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};

export const rotateGatewayTokenSchema = {
  params: z.object({
    gatewayId: z.string().min(1)
  })
};
