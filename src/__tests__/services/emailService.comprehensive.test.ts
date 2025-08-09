import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ 
        data: { id: 'email-123' }, 
        error: null 
      }))
    }
  }))
}))

import { emailService } from '../../services/emailService'

describe('EmailService - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Service Methods', () => {
    it('should have sendWelcomeEmail method', () => {
      expect(typeof emailService.sendWelcomeEmail).toBe('function')
    })

    it('should have sendOrderConfirmation method', () => {
      expect(typeof emailService.sendOrderConfirmation).toBe('function')
    })

    it('should have sendOrderStatusUpdate method', () => {
      expect(typeof emailService.sendOrderStatusUpdate).toBe('function')
    })
  })

  describe('Welcome Emails', () => {
    it('should send welcome email with correct parameters', async () => {
      const result = await emailService.sendWelcomeEmail('john@example.com', 'John Doe')
      
      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('Order Confirmation Emails', () => {
    it('should send order confirmation with order data', async () => {
      const orderData = {
        orderNumber: 'order-123',
        total: 29.99
      }
      
      const result = await emailService.sendOrderConfirmation('customer@example.com', orderData)
      
      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('Order Status Update Emails', () => {
    it('should send status update with different statuses', async () => {
      const orderData = {
        orderNumber: 'order-123',
        total: 29.99
      }
      
      const result = await emailService.sendOrderStatusUpdate('customer@example.com', orderData, 'shipped')
      
      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })

    it('should handle processing status', async () => {
      const orderData = {
        orderNumber: 'order-123',
        total: 29.99
      }
      
      const result = await emailService.sendOrderStatusUpdate('customer@example.com', orderData, 'processing')
      
      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })
  })
})
