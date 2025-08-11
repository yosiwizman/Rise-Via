import { describe, it, expect } from 'vitest'

describe('Number Utils', () => {
  it('should format currency', () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
    
    expect(formatCurrency(29.99)).toBe('$29.99')
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('should calculate percentage', () => {
    const calculatePercentage = (value: number, total: number) => {
      return Math.round((value / total) * 100)
    }
    
    expect(calculatePercentage(25, 100)).toBe(25)
    expect(calculatePercentage(1, 3)).toBe(33)
  })

  it('should clamp numbers', () => {
    const clamp = (num: number, min: number, max: number) => {
      return Math.min(Math.max(num, min), max)
    }
    
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('should generate random numbers', () => {
    const randomBetween = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    
    const random = randomBetween(1, 10)
    expect(random).toBeGreaterThanOrEqual(1)
    expect(random).toBeLessThanOrEqual(10)
  })
})
