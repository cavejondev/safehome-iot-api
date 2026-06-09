/**
 * Schemas das cargas enviadas pelos dispositivos IoT.
 */
import { z } from 'zod';

const jsonRecordSchema = z.record(z.unknown()).optional();

export const recordPresenceSchema = {
  body: z.object({
    sensorExternalId: z.string().min(2),
    detectedAt: z.string().optional(),
    sourceEventId: z.string().optional(),
    metadata: jsonRecordSchema
  })
};

export const recordHelpEventSchema = {
  body: z.object({
    buttonExternalId: z.string().min(2),
    triggeredAt: z.string().optional(),
    sourceEventId: z.string().optional(),
    metadata: jsonRecordSchema
  })
};

export const recordHeartbeatSchema = {
  body: z.object({
    gatewaySeenAt: z.string().optional(),
    sensors: z
      .array(
        z.object({
          externalId: z.string().min(2),
          lastSeenAt: z.string().optional(),
          metadata: jsonRecordSchema
        })
      )
      .default([]),
    helpButtons: z
      .array(
        z.object({
          externalId: z.string().min(2),
          lastSeenAt: z.string().optional(),
          metadata: jsonRecordSchema
        })
      )
      .default([])
  })
};
