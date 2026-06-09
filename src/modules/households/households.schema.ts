/**
 * Schemas de criacao e configuracao da residencia monitorada.
 */
import { PlanTier } from '@prisma/client';
import { z } from 'zod';

export const createHouseholdSchema = {
  body: z.object({
    name: z.string().min(3),
    residentName: z.string().min(3),
    addressLabel: z.string().optional(),
    timezone: z.string().optional(),
    plan: z.nativeEnum(PlanTier).optional()
  })
};

export const householdIdParamSchema = {
  params: z.object({
    householdId: z.string().min(1)
  })
};

export const updateHouseholdSettingsSchema = {
  params: z.object({
    householdId: z.string().min(1)
  }),
  body: z.object({
    inactivityThresholdMinutes: z.number().int().positive().optional(),
    sensorCheckIntervalMinutes: z.number().int().positive().optional(),
    buttonCheckIntervalMinutes: z.number().int().positive().optional(),
    sleepModeStart: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    sleepModeEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
    quietHoursEnabled: z.boolean().optional()
  })
};
