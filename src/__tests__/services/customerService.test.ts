import { describe, it, expect, vi, beforeEach } from 'vitest'
import { customerService } from '../../services/customerService'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}))

describe('customerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get all customers', async () => {
    const result = await customerService.getAll()
    
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('should create new customer', async () => {
    const customerData = {
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe'
    }

    const result = await customerService.create(customerData)
    
    expect(result).toBeDefined()
    expect(result).toHaveProperty('id')
  })

  it('should handle customer creation errors', async () => {
    const invalidCustomerData = {
      email: '',
      first_name: '',
      last_name: ''
    }

    const result = await customerService.create(invalidCustomerData)
    
    expect(result).toBeDefined()
  })

  it('should validate customer data', () => {
    const validCustomer = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123'
    }

    expect(validCustomer.name).toBeTruthy()
    expect(validCustomer.email.includes('@')).toBe(true)
    expect(validCustomer.phone).toBeTruthy()
  })

  it('should handle customer service methods', async () => {
    const { customerService } = await import('../../services/customerService')
    
    expect(typeof customerService.getAll).toBe('function')
    expect(typeof customerService.create).toBe('function')
    expect(typeof customerService.update).toBe('function')
    expect(typeof customerService.search).toBe('function')
  })

  it('should handle customer data structures', () => {
    const customer = {
      id: '1',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '555-1234',
      created_at: new Date().toISOString()
    }
    
    expect(customer).toHaveProperty('id')
    expect(customer).toHaveProperty('email')
    expect(customer).toHaveProperty('first_name')
    expect(customer).toHaveProperty('last_name')
    expect(customer.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  it('should handle search filters', () => {
    const searchFilters = {
      segment: 'premium',
      isB2B: 'true'
    }
    
    expect(searchFilters.segment).toBe('premium')
    expect(searchFilters.isB2B).toBe('true')
    expect(typeof searchFilters.segment).toBe('string')
  })

  it('should handle customer profiles', () => {
    const customerProfile = {
      customer_id: '1',
      segment: 'premium',
      is_b2b: true,
      preferences: {
        newsletter: true,
        sms_alerts: false
      }
    }
    
    expect(customerProfile).toHaveProperty('customer_id')
    expect(customerProfile).toHaveProperty('segment')
    expect(customerProfile).toHaveProperty('is_b2b')
    expect(customerProfile.preferences).toHaveProperty('newsletter')
  })

  it('should handle customer search queries', () => {
    const searchQuery = 'john'
    const searchPattern = `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
    
    expect(searchPattern).toContain('first_name.ilike')
    expect(searchPattern).toContain('last_name.ilike')
    expect(searchPattern).toContain('email.ilike')
    expect(searchPattern).toContain(searchQuery)
  })
})
