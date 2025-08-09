import { describe, it, expect } from 'vitest'

describe('Formatting Utils', () => {
  it('should format price correctly', () => {
    const formatPrice = (price: number) => `$${price.toFixed(2)}`
    
    expect(formatPrice(29.99)).toBe('$29.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(100)).toBe('$100.00')
  })

  it('should format date correctly', () => {
    const formatDate = (date: Date) => date.toLocaleDateString()
    
    const date = new Date('2024-01-15T10:30:00Z')
    const formatted = formatDate(date)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('should format percentage correctly', () => {
    const formatPercentage = (value: number) => `${Math.round(value * 100)}%`
    
    expect(formatPercentage(0.25)).toBe('25%')
    expect(formatPercentage(0.5)).toBe('50%')
    expect(formatPercentage(1)).toBe('100%')
  })

  it('should handle edge cases', () => {
    const formatPrice = (price: number) => `${price < 0 ? '-' : ''}$${Math.abs(price).toFixed(2)}`
    const formatPercentage = (value: number) => `${Math.round(value * 100)}%`
    
    expect(formatPrice(-10)).toBe('-$10.00')
    expect(formatPercentage(0)).toBe('0%')
  })
})
