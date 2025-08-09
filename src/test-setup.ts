import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Supabase mock
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1, session_token: 'test' }, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1, session_token: 'test' }, error: null })),
        })),
      })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))

// Neon mock
vi.mock('./lib/neon', () => {
  const mockSql = vi.fn()
  
  mockSql.mockImplementation((query) => {
    const queryStr = Array.isArray(query) ? query.join('') : String(query)
    
    if (queryStr.includes('INSERT INTO customers')) {
      return Promise.resolve([{ 
        id: 1, 
        first_name: 'John', 
        last_name: 'Doe', 
        email: 'john@example.com',
        created_at: new Date().toISOString()
      }])
    }
    
    if (queryStr.includes('SELECT * FROM customers')) {
      if (queryStr.includes('WHERE')) {
        return Promise.resolve([{ 
          id: 1, 
          first_name: 'John', 
          last_name: 'Doe', 
          email: 'john@example.com' 
        }])
      }
      return Promise.resolve([
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ])
    }
    
    if (queryStr.includes('UPDATE customers')) {
      return Promise.resolve([{ 
        id: 1, 
        first_name: 'John Updated', 
        last_name: 'Doe', 
        email: 'john@example.com' 
      }])
    }
    
    if (queryStr.includes('INSERT INTO wishlist_sessions')) {
      return Promise.resolve([{ 
        id: 'session-1', 
        session_token: 'test-token',
        created_at: new Date().toISOString()
      }])
    }
    
    if (queryStr.includes('SELECT * FROM wishlist_sessions')) {
      return Promise.resolve([{ 
        id: 'session-1', 
        session_token: 'test-token' 
      }])
    }
    
    if (queryStr.includes('INSERT INTO wishlist_items')) {
      return Promise.resolve([{ 
        id: 1, 
        session_id: 'session-1', 
        product_id: 'test-product',
        created_at: new Date().toISOString()
      }])
    }
    
    if (queryStr.includes('DELETE FROM wishlist_items')) {
      return Promise.resolve([])
    }
    
    return Promise.resolve([])
  })
  
  return { sql: mockSql }
})

Object.defineProperty(import.meta, 'env', {
  value: {
    MODE: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
  writable: true,
})
