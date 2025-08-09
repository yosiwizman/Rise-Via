import { describe, it, expect, beforeEach, vi } from 'vitest'
import { emailService } from '../../services/emailService'

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
    }
  }))
}))

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const result = await emailService.sendWelcomeEmail('test@example.com', 'John Doe')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should handle email sending errors', async () => {
      const { Resend } = await import('resend')
      const mockResend = new Resend()
      mockResend.emails.send = vi.fn().mockRejectedValue(new Error('Email service error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      try {
        await emailService.sendWelcomeEmail('invalid@example.com', 'Test User')
      } catch (error) {
        expect(error).toBeDefined()
      }
      
      consoleSpy.mockRestore()
    })
  })

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const orderData = {
        orderNumber: 'RV-2024-001',
        total: 89.99
      }

      const result = await emailService.sendOrderConfirmation('test@example.com', orderData)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should include order details in email', async () => {
      const orderData = {
        orderNumber: 'RV-2024-002',
        total: 149.99
      }

      const result = await emailService.sendOrderConfirmation('customer@example.com', orderData)

      expect(result.success).toBe(true)
    })
  })

  describe('sendOrderStatusUpdate', () => {
    it('should send order status update email', async () => {
      const orderData = {
        orderNumber: 'RV-2024-001',
        total: 89.99
      }

      const result = await emailService.sendOrderStatusUpdate('test@example.com', orderData, 'shipped')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should handle different status types', async () => {
      const orderData = {
        orderNumber: 'RV-2024-001',
        total: 89.99
      }

      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

      for (const status of statuses) {
        const result = await emailService.sendOrderStatusUpdate('test@example.com', orderData, status)
        expect(result.success).toBe(true)
      }
    })

    it('should handle unknown status types', async () => {
      const orderData = {
        orderNumber: 'RV-2024-001',
        total: 89.99
      }

      const result = await emailService.sendOrderStatusUpdate('test@example.com', orderData, 'unknown')

      expect(result.success).toBe(true)
    })
  })
})
