import { describe, expect, it } from 'vitest';
import { PATHS } from '../paths';
import { resolveLegacyHashRedirect } from '../HashLegacyRedirect';

describe('resolveLegacyHashRedirect', () => {
  it('redireciona hash legado #/admin para início', () => {
    expect(resolveLegacyHashRedirect('#/admin')).toBe(PATHS.admin.inicio);
    expect(resolveLegacyHashRedirect('#/admin/')).toBe(PATHS.admin.inicio);
  });

  it('não redireciona rotas admin com subcaminho', () => {
    expect(resolveLegacyHashRedirect('#/admin/estatisticas')).toBeNull();
    expect(resolveLegacyHashRedirect('#/admin/agenda')).toBeNull();
    expect(resolveLegacyHashRedirect('#/admin/inicio')).toBeNull();
  });

  it('redireciona hash legado #/portal para mensagens', () => {
    expect(resolveLegacyHashRedirect('#/portal')).toBe(PATHS.portal.mensagens);
  });

  it('não redireciona rotas portal com subcaminho', () => {
    expect(resolveLegacyHashRedirect('#/portal/perfil')).toBeNull();
  });
});
