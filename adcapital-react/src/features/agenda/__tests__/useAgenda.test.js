import { describe, it, expect } from 'vitest';
import { normalizeDateTimeForApi } from '../useAgenda';

describe('normalizeDateTimeForApi', () => {
  it('preserva datetime-local do navegador sem converter para UTC', () => {
    const value = '2026-02-09T19:30';
    expect(normalizeDateTimeForApi(value)).toBe('2026-02-09T19:30');
  });

  it('preserva ISO com timezone quando já chegou no formato UTC', () => {
    const value = '2026-02-09T22:30:00Z';
    expect(normalizeDateTimeForApi(value)).toBe('2026-02-09T22:30:00Z');
  });
});
