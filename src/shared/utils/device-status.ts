/**
 * Calcula o status atual de sensores, botoes e gateway com base no ultimo contato.
 */
import { diffInMinutes } from './time';

export type DeviceStatus = 'online' | 'offline' | 'disabled';

export function getDeviceStatus(
  isActive: boolean,
  lastSeenAt: Date | null | undefined,
  offlineAfterMinutes: number
): DeviceStatus {
  if (!isActive) {
    return 'disabled';
  }

  if (!lastSeenAt) {
    return 'offline';
  }

  return diffInMinutes(lastSeenAt) <= offlineAfterMinutes ? 'online' : 'offline';
}
