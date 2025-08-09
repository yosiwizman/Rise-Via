import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/supabase', () => {
  const mockChain: any = {
    select: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    or: vi.fn(() => mockChain),
    order: vi.fn(() => Promise.resolve({ data: [{ id: 'test-id', email: 'test@example.com' }], error: null })),
    single: vi.fn(() => Promise.resolve({ data: { id: 'test-id', email: 'test@example.com' }, error: null })),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
  }

  return {
    supabase: {
      from: vi.fn(() => mockChain),
    }
  }
})

import { customerService } from '../../services/customerService'

describe('customerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new customer', async () => {
      const customerData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-1234'
      }

      const result = await customerService.create(customerData)

      expect(result).toBeDefined()
      expect(result.email).toBe('test@example.com')
    })
  })

  describe('getAll', () => {
    it('should retrieve all customers', async () => {
      const result = await customerService.getAll()

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('update', () => {
    it('should update customer information', async () => {
      const updateData = {
        first_name: 'Jane',
        last_name: 'Smith'
      }

      const result = await customerService.update('test-id', updateData)

      expect(result).toBeDefined()
    })
  })

  describe('search', () => {
    it('should search customers by email', async () => {
      const result = await customerService.search('test@example.com')

      expect(Array.isArray(result)).toBe(true)
    })

    it('should search customers by name', async () => {
      const result = await customerService.search('John Doe')

      expect(Array.isArray(result)).toBe(true)
    })

    it('should search with filters', async () => {
      const filters = {
        segment: 'premium',
        isB2B: 'false'
      }

      const result = await customerService.search('test', filters)

      expect(Array.isArray(result)).toBe(true)
    })
  })
})
