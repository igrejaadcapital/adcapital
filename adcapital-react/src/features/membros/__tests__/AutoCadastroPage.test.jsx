import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AutoCadastroPage from '../AutoCadastroPage';
import '@testing-library/jest-dom';

// Mock axios or service calls
vi.mock('../../../api/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    get: vi.fn().mockResolvedValue({ data: [] })
  }
}));

describe('AutoCadastroPage', () => {
  it('renderiza o formulário sem quebrar', () => {
    const { container } = render(<AutoCadastroPage />);
    expect(container).toBeTruthy();
  });
});
