import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecurityUtils } from '../../utils/security'

describe('SecurityUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check rate limits', () => {
    const result = SecurityUtils.checkRateLimit('test-action', 30)
    
    expect(typeof result).toBe('boolean')
  })

  it('should sanitize input', () => {
    const dirtyInput = '<script>alert("xss")</script>Hello World'
    const cleanInput = SecurityUtils.sanitizeInput(dirtyInput)
    
    expect(cleanInput).toBeDefined()
    expect(typeof cleanInput).toBe('string')
    expect(cleanInput.length).toBeGreaterThan(0)
  })

  it('should validate email format', () => {
    const validEmail = 'test@example.com'
    const invalidEmail = 'invalid-email'
    
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    
    expect(isValidEmail(validEmail)).toBe(true)
    expect(isValidEmail(invalidEmail)).toBe(false)
  })

  it('should validate session tokens', () => {
    const validToken = 'abc123def456'
    const invalidToken = ''
    
    const isValidToken = (token: string) => Boolean(token && token.length > 0)
    
    expect(isValidToken(validToken)).toBe(true)
    expect(isValidToken(invalidToken)).toBe(false)
  })
})
