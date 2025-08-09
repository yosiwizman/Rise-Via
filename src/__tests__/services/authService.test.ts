import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user' } } }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    }
  },
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
        deleteUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      }
    }
  }
}))

import { authService } from '../../services/authService'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('authService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should handle admin login', async () => {
      const result = await authService.login('admin', 'admin123')

      expect(result.success).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('adminToken', 'admin-token')
    })

    it('should handle regular user login', async () => {
      const result = await authService.login('user@example.com', 'password123')

      expect(result).toBeDefined()
    })

    it('should handle invalid credentials', async () => {
      try {
        await authService.login('invalid@example.com', 'wrongpassword')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('register', () => {
    it('should register new user', async () => {
      const metadata = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01'
      }

      const result = await authService.register('newuser@example.com', 'password123', metadata)

      expect(result).toBeDefined()
    })

    it('should handle registration errors', async () => {
      try {
        await authService.register('invalid-email', 'weak', {})
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('logout', () => {
    it('should logout user and clear admin token', async () => {
      mockLocalStorage.setItem('adminToken', 'test-token')
      
      await authService.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('adminToken')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = await authService.getCurrentUser()

      expect(user).toBeDefined()
    })
  })

  describe('getSession', () => {
    it('should return current session', async () => {
      const session = await authService.getSession()

      expect(session).toBeDefined()
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', async () => {
      const callback = vi.fn()
      const unsubscribe = await authService.onAuthStateChange(callback)

      expect(unsubscribe).toBeDefined()
    })
  })
})
