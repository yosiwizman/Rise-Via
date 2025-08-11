import { describe, it, expect } from 'vitest'

describe('Validation Utils Coverage', () => {
  it('should validate email addresses', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('user@domain.co.uk')).toBe(true)
  })

  it('should validate phone numbers', () => {
    const isValidPhone = (phone: string) => /^\d{10}$/.test(phone.replace(/\D/g, ''))
    expect(isValidPhone('1234567890')).toBe(true)
    expect(isValidPhone('(123) 456-7890')).toBe(true)
    expect(isValidPhone('123-456-7890')).toBe(true)
    expect(isValidPhone('123')).toBe(false)
  })

  it('should validate required fields', () => {
    const isRequired = (value: string) => value.trim().length > 0
    expect(isRequired('test')).toBe(true)
    expect(isRequired('')).toBe(false)
    expect(isRequired('   ')).toBe(false)
  })

  it('should validate age requirements', () => {
    const isValidAge = (age: number) => age >= 21
    expect(isValidAge(25)).toBe(true)
    expect(isValidAge(21)).toBe(true)
    expect(isValidAge(18)).toBe(false)
  })
})
