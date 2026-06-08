import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../LandingPage';
import '@testing-library/jest-dom';

vi.mock('../../api/config', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}));

// Mock das sub-components que fazem requests
vi.mock('../Secoes/InstagramFeed', () => ({
  default: () => <div data-testid="instagram-feed" />
}));

vi.mock('../Secoes/GaleriaSecao', () => ({
  default: () => <div data-testid="galeria" />
}));

vi.mock('../Secoes/ProgramacaoSecao', () => ({
  default: () => <div data-testid="programacao" />
}));

describe('LandingPage', () => {
  it('renderiza a página e suas seções sem quebrar', async () => {
    const { container } = render(<LandingPage />);
    expect(container).toBeTruthy();
  });
});
