import { describe, it, expect } from 'vitest'

describe('Date Utils', () => {
  it('should format dates correctly', () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toContain('2024')
    expect(formatted).toContain('January')
  })

  it('should calculate time differences', () => {
    const getTimeDiff = (date1: Date, date2: Date) => {
      return Math.abs(date2.getTime() - date1.getTime())
    }
    
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-01-02')
    const diff = getTimeDiff(date1, date2)
    
    expect(diff).toBe(24 * 60 * 60 * 1000) // 1 day in milliseconds
  })

  it('should validate date ranges', () => {
    const isValidDateRange = (start: Date, end: Date) => {
      return start <= end
    }
    
    const start = new Date('2024-01-01')
    const end = new Date('2024-01-31')
    
    expect(isValidDateRange(start, end)).toBe(true)
    expect(isValidDateRange(end, start)).toBe(false)
  })
})
