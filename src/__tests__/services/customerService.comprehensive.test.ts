import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/neon', () => {
  const mockSql = vi.fn()
  
  mockSql.mockImplementation((query) => {
    const queryStr = Array.isArray(query) ? query.join('') : String(query)
    
    if (queryStr.includes('SELECT c.*') && queryStr.includes('json_agg(cp.*)') && queryStr.includes('GROUP BY c.id')) {
      if (queryStr.includes('WHERE')) {
        return Promise.resolve([
          { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', customer_profiles: [{}] }
        ])
      }
      return Promise.resolve([
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', customer_profiles: [{}] },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', customer_profiles: [{}] }
      ])
    }
    
    if (queryStr.includes('INSERT INTO customers')) {
      return Promise.resolve([
        { id: 3, first_name: 'New', last_name: 'Customer', email: 'new@example.com' }
      ])
    }
    
    if (queryStr.includes('INSERT INTO customer_profiles') && queryStr.includes('customer_id')) {
      return Promise.resolve([
        { id: 1, customer_id: 3 }
      ])
    }
    
    if (queryStr.includes('UPDATE customers')) {
      return Promise.resolve([
        { id: 1, first_name: 'Updated', last_name: 'Customer', email: 'john@example.com' }
      ])
    }
    
    return Promise.resolve([])
  })
  
  return { sql: mockSql }
})

import { customerService } from '../../services/customerService'

describe('CustomerService - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Customer Management', () => {
    it('should get all customers', async () => {
      const customers = await customerService.getAll()
      
      expect(customers).toHaveLength(2)
      expect(customers[0]).toHaveProperty('first_name', 'John')
      expect(customers[1]).toHaveProperty('email', 'jane@example.com')
    })

    it('should create new customer', async () => {
      const customerData = {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@example.com',
        phone: '555-0123'
      }
      
      const result = await customerService.create(customerData)
      
      expect(result).toHaveProperty('id', 3)
      expect(result).toHaveProperty('first_name', 'New')
    })

    it('should update existing customer', async () => {
      const updateData = { first_name: 'Updated' }
      
      const result = await customerService.update('1', updateData)
      
      expect(result).toHaveProperty('id', 1)
      expect(result).toHaveProperty('first_name', 'Updated')
    })
  })

  describe('Search Functionality', () => {
    it('should search customers by name', async () => {
      const results = await customerService.search('John')
      
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveProperty('first_name', 'John')
    })

    it('should search with segment filter', async () => {
      const results = await customerService.search('', { segment: 'vip' })
      
      expect(Array.isArray(results)).toBe(true)
    })

    it('should search with B2B filter', async () => {
      const results = await customerService.search('', { isB2B: 'true' })
      
      expect(Array.isArray(results)).toBe(true)
    })
  })
})
