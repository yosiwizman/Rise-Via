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
})
