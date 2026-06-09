/**
 * Consolida eventos de sensores e botoes em um formato unico para o app.
 */
import { prisma } from '../../database/prisma';
import { assertHouseholdMembership } from '../../shared/utils/access-control';

interface ListEventsInput {
  limit: number;
  from?: string;
  to?: string;
}

export class EventsService {
  public async list(userId: string, householdId: string, input: ListEventsInput) {
    await assertHouseholdMembership(userId, householdId);

    const sensorDateFilter = {
      gte: input.from ? new Date(input.from) : undefined,
      lte: input.to ? new Date(input.to) : undefined
    };

    const [sensorEvents, helpEvents] = await Promise.all([
      prisma.sensorEvent.findMany({
        where: {
          householdId,
          detectedAt: sensorDateFilter
        },
        include: {
          sensor: true
        },
        orderBy: {
          detectedAt: 'desc'
        },
        take: input.limit
      }),
      prisma.helpButtonEvent.findMany({
        where: {
          householdId,
          triggeredAt: sensorDateFilter
        },
        include: {
          helpButton: true
        },
        orderBy: {
          triggeredAt: 'desc'
        },
        take: input.limit
      })
    ]);

    return [...sensorEvents.map((event) => ({
      id: event.id,
      type: 'presence',
      occurredAt: event.detectedAt,
      deviceId: event.sensorId,
      deviceName: event.sensor.name,
      locationLabel: event.sensor.locationLabel
    })), ...helpEvents.map((event) => ({
      id: event.id,
      type: 'help',
      occurredAt: event.triggeredAt,
      deviceId: event.helpButtonId,
      deviceName: event.helpButton.name,
      locationLabel: event.helpButton.locationLabel
    }))]
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
      .slice(0, input.limit);
  }
}

export const eventsService = new EventsService();
