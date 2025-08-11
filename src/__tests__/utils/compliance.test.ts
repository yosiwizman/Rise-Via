import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ComplianceManager, type AgeVerificationData } from '../../utils/compliance'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ComplianceManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('verifyAge', () => {
    it('should verify valid age', () => {
      const data: AgeVerificationData = {
        birthDate: new Date('1990-01-01'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      }

      const result = ComplianceManager.verifyAge(data)
      
      expect(result.isValid).toBe(true)
      expect(result.riskScore).toBeLessThan(0.8)
    })

    it('should reject underage users', () => {
      const data: AgeVerificationData = {
        birthDate: new Date('2010-01-01'), // 14 years old
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      }

      const result = ComplianceManager.verifyAge(data)
      
      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
      expect(result.reasons).toContain('User is under 21 years old')
    })

    it('should handle missing birth date', () => {
      const data: AgeVerificationData = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: Date.now()
      }

      const result = ComplianceManager.verifyAge(data)
      
      expect(result.reasons).toContain('No birth date provided')
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('should detect suspicious user agents', () => {
      const data: AgeVerificationData = {
        birthDate: new Date('1990-01-01'),
        userAgent: 'bot crawler spider',
        timestamp: Date.now()
      }

      const result = ComplianceManager.verifyAge(data)
      
      expect(result.reasons.some(r => r.includes('Automated browser'))).toBe(true)
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('should detect rapid verification attempts', () => {
      const timestamp = Date.now()
      localStorageMock.getItem.mockReturnValue((timestamp - 1000).toString()) // 1 second ago
      
      const data: AgeVerificationData = {
        birthDate: new Date('1990-01-01'),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp
      }

      const result = ComplianceManager.verifyAge(data)
      
      expect(result.reasons.some(r => r.includes('Rapid successive'))).toBe(true)
    })
  })

  describe('checkStateCompliance', () => {
    it('should allow valid states', () => {
      const result = ComplianceManager.checkStateCompliance('CA')
      
      expect(result.isValid).toBe(true)
      expect(result.riskScore).toBeLessThan(1.0)
    })

    it('should block restricted states', () => {
      const result = ComplianceManager.checkStateCompliance('ID') // Idaho is blocked
      
      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
      expect(result.reasons[0]).toContain('ID')
    })

    it('should handle missing state with IP fallback', () => {
      const result = ComplianceManager.checkStateCompliance(undefined, '192.168.1.1')
      
      expect(result.reasons).toContain('No state information provided')
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('should be case insensitive', () => {
      const result = ComplianceManager.checkStateCompliance('id') // lowercase
      
      expect(result.isValid).toBe(false)
      expect(result.riskScore).toBe(1.0)
    })
  })
})
