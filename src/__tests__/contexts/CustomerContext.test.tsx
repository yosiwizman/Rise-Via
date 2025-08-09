import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { CustomerProvider, useCustomer } from '../../contexts/CustomerContext'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: {
              id: 'customer-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            }, 
            error: null 
          }))
        })),
        order: vi.fn(() => Promise.resolve({ 
          data: [
            {
              id: 'customer-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            }
          ], 
          error: null 
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}))

const TestComponent = () => {
  const { customer, isAuthenticated, loading } = useCustomer()
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Not authenticated</div>
  
  return (
    <div>
      <div>Welcome {customer?.firstName} {customer?.lastName}</div>
      <div>Email: {customer?.email}</div>
    </div>
  )
}

describe('CustomerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide customer context', async () => {
    const { supabase } = await import('../../lib/supabase')
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { 
        user: { 
          id: 'user-1', 
          email: 'john@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2023-01-01T00:00:00Z'
        } 
      },
      error: null
    })

    render(
      <CustomerProvider>
        <TestComponent />
      </CustomerProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Welcome John Doe')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
  })

  it('should handle unauthenticated state', async () => {
    const { supabase } = await import('../../lib/supabase')
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null
    } as any)

    render(
      <CustomerProvider>
        <TestComponent />
      </CustomerProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    })
  })

  it('should handle authentication errors', async () => {
    const { supabase } = await import('../../lib/supabase')
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: {
        message: 'Auth error',
        code: 'auth_error',
        status: 401,
        __isAuthError: true,
        name: 'AuthError'
      } as any
    })

    render(
      <CustomerProvider>
        <TestComponent />
      </CustomerProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    })
  })

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useCustomer must be used within CustomerProvider')
    
    consoleSpy.mockRestore()
  })

  it('should handle loading state', () => {
    render(
      <CustomerProvider>
        <TestComponent />
      </CustomerProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
