import { describe, it, expect } from 'vitest'
import { isStateBlocked, getBlockedStateMessage, validateShippingState } from '../../utils/stateBlocking'

describe('stateBlocking', () => {
  it('should identify blocked states', () => {
    expect(isStateBlocked('ID')).toBe(true)
    expect(isStateBlocked('CO')).toBe(true) // CO is blocked according to constants
    expect(isStateBlocked('CA')).toBe(false) // CA is not in blocked list
    expect(isStateBlocked('TX')).toBe(false) // TX is not in blocked list
  })

  it('should provide appropriate messages for blocked states', () => {
    const message = getBlockedStateMessage('ID')
    expect(message).toContain('cannot ship')
    expect(typeof message).toBe('string')
  })

  it('should validate shipping states', () => {
    const validResult = validateShippingState('TX') // TX is not blocked
    expect(validResult.isValid).toBe(true)
    expect(validResult.message).toBeUndefined()

    const invalidResult = validateShippingState('ID')
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.message).toContain('cannot ship')
  })

  it('should handle empty state codes', () => {
    const result = validateShippingState('')
    expect(result.isValid).toBe(false)
    expect(result.message).toContain('select your state')
  })

  it('should handle invalid state codes', () => {
    expect(isStateBlocked('XX')).toBe(false)
  })

  it('should handle lowercase state codes', () => {
    expect(isStateBlocked('id')).toBe(true)
    expect(isStateBlocked('tx')).toBe(false) // TX is not blocked
  })
})
