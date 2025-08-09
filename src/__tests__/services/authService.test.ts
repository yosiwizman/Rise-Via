import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../services/authService'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}))

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should handle admin login', async () => {
      const result = await authService.login('admin', 'admin123')
      
      expect(result.success).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('adminToken', 'admin-token')
    })

    it('should handle regular user login', async () => {
      const mockData = { user: { id: '1', email: 'test@example.com' } }
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { 
          user: {
            ...mockData.user,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          } as any, 
          session: {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockData.user
          } as any
        },
        error: null
      })

      const result = await authService.login('test@example.com', 'password123')
      
      expect(result.user.id).toBe(mockData.user.id)
      expect(result.user.email).toBe(mockData.user.email)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle login errors', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid credentials',
          code: 'invalid_credentials',
          status: 400,
          __isAuthError: true,
          name: 'AuthError'
        } as any
      })

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register new user', async () => {
      const mockData = { user: { id: '1', email: 'new@example.com' } }
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { 
          user: {
            ...mockData.user,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          } as any, 
          session: {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockData.user
          } as any
        },
        error: null
      })

      const metadata = { firstName: 'John', lastName: 'Doe' }
      const result = await authService.register('new@example.com', 'password123', metadata)
      
      expect(result.user.id).toBe(mockData.user.id)
      expect(result.user.email).toBe(mockData.user.email)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: { data: metadata }
      })
    })

    it('should handle registration errors', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email already exists',
          code: 'email_exists',
          status: 400,
          __isAuthError: true,
          name: 'AuthError'
        } as any
      })

      await expect(authService.register('existing@example.com', 'password123', {})).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should logout user and clear admin token', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await authService.logout()
      
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const mockUser = { id: '1', email: 'current@example.com' }
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { 
          user: {
            ...mockUser,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          } as any
        },
        error: null
      })

      const result = await authService.getCurrentUser()
      
      expect(result.id).toBe(mockUser.id)
      expect(result.email).toBe(mockUser.email)
    })
  })

  describe('getSession', () => {
    it('should get current session', async () => {
      const mockSession = { access_token: 'token', user: { id: '1' } }
      const { supabase } = await import('../../lib/supabase')
      
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { 
          session: {
            ...mockSession,
            refresh_token: 'refresh_token',
            expires_in: 3600,
            token_type: 'bearer'
          } as any
        },
        error: null
      })

      const result = await authService.getSession()
      
      expect(result.access_token).toBe(mockSession.access_token)
      expect(result.user.id).toBe(mockSession.user.id)
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockCallback = vi.fn()
      
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { 
          subscription: { 
            id: 'test-subscription',
            callback: vi.fn(),
            unsubscribe: vi.fn() 
          } as any
        }
      })

      const result = await authService.onAuthStateChange(mockCallback)
      
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toHaveProperty('data')
    })
  })
})
