import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('import.meta', () => ({
  env: {
    VITE_DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
    VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
    VITE_RESEND_API_KEY: 're_test_123',
    MODE: 'test',
  },
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    return vi.fn(async (query: string, _params?: any[]) => {
      if (query.includes('SELECT')) {
        return { rows: [], rowCount: 0 };
      }
      if (query.includes('INSERT')) {
        return { rows: [{ id: 1 }], rowCount: 1 };
      }
      if (query.includes('UPDATE')) {
        return { rows: [], rowCount: 1 };
      }
      if (query.includes('DELETE')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
  }),
  Pool: vi.fn().mockImplementation(() => ({
    query: vi.fn(() => Promise.resolve({ rows: [], rowCount: 0 })),
    connect: vi.fn(() => Promise.resolve({
      query: vi.fn(() => Promise.resolve({ rows: [], rowCount: 0 })),
      release: vi.fn(),
    })),
    end: vi.fn(),
  })),
}));

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(),
      getElement: vi.fn(),
    })),
    confirmCardPayment: vi.fn(() => Promise.resolve({
      paymentIntent: { status: 'succeeded' },
    })),
  })),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.localStorage = localStorageMock as any;
