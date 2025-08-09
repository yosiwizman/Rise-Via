import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('./lib/neon', () => ({
  sql: vi.fn(() => Promise.resolve([])),
}))

Object.defineProperty(import.meta, 'env', {
  value: {
    MODE: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
  writable: true,
})
