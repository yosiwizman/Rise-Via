import { describe, it, expect } from 'vitest'

describe('Validation Utils', () => {
  it('should validate email format', () => {
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }
    
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  it('should validate age requirements', () => {
    const validateAge = (age: number) => age >= 18
    
    expect(validateAge(25)).toBe(true)
    expect(validateAge(18)).toBe(true)
    expect(validateAge(17)).toBe(false)
    expect(validateAge(0)).toBe(false)
  })

  it('should validate required fields', () => {
    const validateRequired = (value: unknown) => {
      return value !== null && value !== undefined && String(value).trim() !== ''
    }
    
    expect(validateRequired('test')).toBe(true)
    expect(validateRequired('')).toBe(false)
    expect(validateRequired(null)).toBe(false)
    expect(validateRequired(undefined)).toBe(false)
  })
})
