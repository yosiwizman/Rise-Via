import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ComplianceManager } from '../../utils/compliance'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('ComplianceManager', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('verifyAge', () => {
    it('should reject users under 21', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 20)
      
      const result = ComplianceManager.verifyAge({
        birthDate,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      })

      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
      expect(result.reasons).toContain('User is under 21 years old')
    })

    it('should accept users 21 and older', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 25)
      
      const result = ComplianceManager.verifyAge({
        birthDate,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      })

      expect(result.isValid).toBe(true)
      expect(result.riskScore).toBeLessThan(0.8)
    })

    it('should increase risk score for young adults', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 22)
      
      const result = ComplianceManager.verifyAge({
        birthDate,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      })

      expect(result.isValid).toBe(true)
      expect(result.reasons).toContain('Young adult - increased verification scrutiny')
    })

    it('should increase risk score for missing birth date', () => {
      const result = ComplianceManager.verifyAge({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      })

      expect(result.reasons).toContain('No birth date provided')
      expect(result.riskScore).toBeGreaterThan(0.3)
    })

    it('should detect suspicious user agents', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 25)
      
      const result = ComplianceManager.verifyAge({
        birthDate,
        userAgent: 'bot crawler spider',
        timestamp: Date.now()
      })

      expect(result.reasons).toContain('Automated browser detected')
    })

    it('should detect rapid verification attempts', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 25)
      const timestamp = Date.now()
      
      mockLocalStorage.setItem('last_age_verification', (timestamp - 1000).toString())
      
      const result = ComplianceManager.verifyAge({
        birthDate,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp
      })

      expect(result.reasons).toContain('Rapid successive verification attempts')
    })
  })

  describe('checkStateCompliance', () => {
    it('should block restricted states', () => {
      const result = ComplianceManager.checkStateCompliance('ID')

      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
      expect(result.reasons[0]).toContain('Shipping to ID is not permitted')
    })

    it('should allow non-restricted states', () => {
      const result = ComplianceManager.checkStateCompliance('CA')

      expect(result.isValid).toBe(true)
      expect(result.riskScore).toBe(0)
    })

    it('should handle missing state information', () => {
      const result = ComplianceManager.checkStateCompliance()

      expect(result.isValid).toBe(true)
      expect(result.reasons).toContain('No state information provided')
      expect(result.riskScore).toBeGreaterThan(0.2)
    })

    it('should be case insensitive', () => {
      const result = ComplianceManager.checkStateCompliance('id')

      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
    })

    it('should handle all blocked states', () => {
      const blockedStates = [
        "ID", "SD", "MS", "OR", "AK", "AR", "CO", "DE", "HI", "IN", 
        "IA", "KS", "KY", "LA", "MD", "MT", "NH", "NY", "NC", "RI", 
        "UT", "VT", "VA"
      ]

      blockedStates.forEach(state => {
        const result = ComplianceManager.checkStateCompliance(state)
        expect(result.isValid).toBe(false)
        expect(result.riskScore).toBe(1.0)
      })
    })
  })
})
