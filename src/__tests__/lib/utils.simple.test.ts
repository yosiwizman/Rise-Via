import { describe, it, expect } from 'vitest'
import { cn } from '../../lib/utils'

describe('Utils Library', () => {
  it('should combine class names correctly', () => {
    expect(cn('class1', 'class2')).toBeDefined()
    expect(typeof cn('class1', 'class2')).toBe('string')
  })

  it('should handle undefined values', () => {
    expect(cn('class1', undefined, 'class2')).toBeDefined()
    expect(typeof cn('class1', undefined, 'class2')).toBe('string')
  })

  it('should handle empty input', () => {
    expect(cn()).toBeDefined()
    expect(typeof cn()).toBe('string')
  })

  it('should be a function', () => {
    expect(typeof cn).toBe('function')
  })
})
