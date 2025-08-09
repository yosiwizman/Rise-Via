import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import { AccountPage } from '../../pages/AccountPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { email: 'test@example.com' } }, 
        error: null 
      })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      update: vi.fn(() => Promise.resolve({ error: null })),
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}))

vi.mock('../../contexts/CustomerContext', () => ({
  useCustomer: vi.fn(() => ({
    customer: {
      id: 'test-customer-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      customer_profiles: [{
        membership_tier: 'GREEN',
        loyalty_points: 150,
        lifetime_value: 299.99,
        total_orders: 3,
        referral_code: 'JOHN123',
        total_referrals: 1
      }]
    },
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateCustomer: vi.fn()
  }))
}))

describe('AccountPage', () => {
  it('should render account content when authenticated', () => {
    render(<AccountPage />)
    
    expect(screen.getByText(/My Account/i)).toBeInTheDocument()
  })

  it('should display membership information', () => {
    render(<AccountPage />)
    
    expect(screen.getByText(/Membership Status/i)).toBeInTheDocument()
  })

  it('should show loyalty points section', () => {
    render(<AccountPage />)
    
    expect(screen.getByText(/Loyalty Points/i)).toBeInTheDocument()
  })

  it('should display recent orders section', () => {
    render(<AccountPage />)
    
    expect(screen.getByText(/Recent Orders/i)).toBeInTheDocument()
  })

  it('should show user welcome message', () => {
    render(<AccountPage />)
    
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
  })
})
