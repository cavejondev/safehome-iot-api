/**
 * Helpers de data e hora usados por alertas, dashboard e relatorios.
 * As funcoes ficam isoladas para facilitar testes e reaproveitamento.
 */
import dayjs from 'dayjs';

export function parseDateOrNow(date?: string | Date): Date {
  if (!date) {
    return new Date();
  }

  return new Date(date);
}

export function diffInMinutes(from: Date, to = new Date()): number {
  return dayjs(to).diff(dayjs(from), 'minute');
}

export function diffInSeconds(from: Date, to = new Date()): number {
  return dayjs(to).diff(dayjs(from), 'second');
}

export function formatElapsedMinutes(date?: Date | null): number | null {
  if (!date) {
    return null;
  }

  return diffInMinutes(date);
}

export function isCurrentTimeInsideWindow(
  startTime?: string | null,
  endTime?: string | null,
  reference = new Date()
): boolean {
  if (!startTime || !endTime) {
    return false;
  }

  const currentMinutes = reference.getHours() * 60 + reference.getMinutes();
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (start === end) {
    return false;
  }

  if (start < end) {
    return currentMinutes >= start && currentMinutes < end;
  }

  return currentMinutes >= start || currentMinutes < end;
}

export function clampDateRangeByDays(days: number, maxDays: number): number {
  return Math.max(1, Math.min(days, maxDays));
}
