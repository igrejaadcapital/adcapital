import { describe, it, expect } from 'vitest';
import { maskCpf, maskPhone, formatCpf, onlyDigits } from '../masks';

describe('masks', () => {
  it('onlyDigits remove caracteres não numéricos', () => {
    expect(onlyDigits('12.3-abc')).toBe('123');
  });

  it('maskCpf formata parcialmente e limita tamanho', () => {
    expect(maskCpf('12345678901')).toBe('123.456.789-01');
    expect(maskCpf('123456789012345')).toHaveLength(14);
  });

  it('maskPhone formata fixo e celular', () => {
    expect(maskPhone('6198765432')).toBe('(61) 9876-5432');
    expect(maskPhone('61987654321')).toBe('(61) 98765-4321');
  });

  it('formatCpf exibe --- quando vazio', () => {
    expect(formatCpf('')).toBe('---');
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
  });
});
