/**
 * Testes unitarios simples para os helpers de horario usados pelo monitoramento.
 */
import { describe, expect, it } from 'vitest';

import { clampDateRangeByDays, isCurrentTimeInsideWindow } from './time';

describe('isCurrentTimeInsideWindow', () => {
  it('deve respeitar janela simples no mesmo dia', () => {
    const inside = isCurrentTimeInsideWindow('08:00', '12:00', new Date('2026-04-08T09:15:00'));
    const outside = isCurrentTimeInsideWindow('08:00', '12:00', new Date('2026-04-08T13:15:00'));

    expect(inside).toBe(true);
    expect(outside).toBe(false);
  });

  it('deve respeitar janela que atravessa meia-noite', () => {
    const inside = isCurrentTimeInsideWindow('22:00', '06:00', new Date('2026-04-08T23:15:00'));
    const outside = isCurrentTimeInsideWindow('22:00', '06:00', new Date('2026-04-08T15:15:00'));

    expect(inside).toBe(true);
    expect(outside).toBe(false);
  });
});

describe('clampDateRangeByDays', () => {
  it('deve limitar os dias conforme o plano', () => {
    expect(clampDateRangeByDays(90, 30)).toBe(30);
    expect(clampDateRangeByDays(0, 30)).toBe(1);
    expect(clampDateRangeByDays(15, 30)).toBe(15);
  });
});
