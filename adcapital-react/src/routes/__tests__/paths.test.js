import { describe, it, expect } from 'vitest';
import { isValidToken, PATHS, PORTAL_TAB_FROM_PATH } from '../paths';

describe('paths', () => {
  it('define rotas admin e portal', () => {
    expect(PATHS.admin.inicio).toBe('/admin/inicio');
    expect(PATHS.portal.mensagens).toBe('/portal/mensagens');
  });

  it('mapeia abas do portal', () => {
    expect(PORTAL_TAB_FROM_PATH[PATHS.portal.agenda]).toBe('agenda');
  });

  it('valida token JWT armazenado', () => {
    expect(isValidToken('abc')).toBe(false);
    expect(isValidToken('null')).toBe(false);
    expect(isValidToken('x'.repeat(20))).toBe(true);
  });
});
