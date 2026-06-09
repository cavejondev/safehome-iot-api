/**
 * Schemas do modulo de sensores de presenca.
 */
import { z } from 'zod';

export const createSensorSchema = {
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

export const listSensorsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};

export const updateSensorSchema = {
  params: z.object({
    sensorId: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    locationLabel: z.string().nullable().optional(),
    isActive: z.boolean().optional()
  })
};

export const deleteSensorSchema = {
  params: z.object({
    sensorId: z.string().min(1)
  })
};
