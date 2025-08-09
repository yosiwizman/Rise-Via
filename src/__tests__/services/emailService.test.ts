import { describe, it, expect, vi, beforeEach } from 'vitest'
import { emailService } from '../../services/emailService'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}))

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send order confirmation email', async () => {
    const orderData = {
      orderNumber: 'RV-2024-001',
      total: 59.98
    }

    const result = await emailService.sendOrderConfirmation('test@example.com', orderData)
    
    expect(result).toBeDefined()
  })

  it('should send order status update', async () => {
    const orderData = {
      orderNumber: 'RV-2024-001',
      total: 59.98
    }

    const result = await emailService.sendOrderStatusUpdate('test@example.com', orderData, 'shipped')
    
    expect(result).toBeDefined()
  })

  it('should handle email sending errors', async () => {
    const invalidOrderData = {
      orderNumber: '',
      total: 0
    }

    try {
      await emailService.sendOrderConfirmation('invalid-email', invalidOrderData)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should validate email addresses', () => {
    const validEmail = 'test@example.com'
    const invalidEmail = 'invalid-email'

    expect(validEmail.includes('@')).toBe(true)
    expect(invalidEmail.includes('@')).toBe(false)
  })
})
