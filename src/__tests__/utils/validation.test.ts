import { describe, it, expect } from 'vitest'

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && !email.includes('..')
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const validateAge = (birthDate: string): boolean => {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 21
  }
  
  return age >= 21
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
  return phoneRegex.test(phone)
}

const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

const validateCreditCard = (cardNumber: string): { isValid: boolean; type: string } => {
  const cleaned = cardNumber.replace(/\s+/g, '')
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  const isValid = sum % 10 === 0
  
  let type = 'unknown'
  if (/^4/.test(cleaned)) type = 'visa'
  else if (/^5[1-5]/.test(cleaned)) type = 'mastercard'
  else if (/^3[47]/.test(cleaned)) type = 'amex'
  else if (/^6/.test(cleaned)) type = 'discover'
  
  return { isValid, type }
}

const validateState = (state: string): boolean => {
  const allowedStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
    'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
    'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD',
    'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]
  
  const restrictedStates = ['ID']
  
  return allowedStates.includes(state.toUpperCase()) && !restrictedStates.includes(state.toUpperCase())
}

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..test@example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(' ')).toBe(false)
      expect(validateEmail('test @example.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should provide specific error messages', () => {
      const result = validatePassword('short')
      expect(result.errors).toContain('Password must be at least 8 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should validate each requirement separately', () => {
      expect(validatePassword('lowercase123!').errors).toContain('Password must contain at least one uppercase letter')
      expect(validatePassword('UPPERCASE123!').errors).toContain('Password must contain at least one lowercase letter')
      expect(validatePassword('NoNumbers!').errors).toContain('Password must contain at least one number')
      expect(validatePassword('NoSpecialChars123').errors).toContain('Password must contain at least one special character')
    })
  })

  describe('validateAge', () => {
    it('should validate users 21 and older', () => {
      const twentyOneYearsAgo = new Date()
      twentyOneYearsAgo.setFullYear(twentyOneYearsAgo.getFullYear() - 21)
      
      expect(validateAge(twentyOneYearsAgo.toISOString().split('T')[0])).toBe(true)
    })

    it('should reject users under 21', () => {
      const twentyYearsAgo = new Date()
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20)
      
      expect(validateAge(twentyYearsAgo.toISOString().split('T')[0])).toBe(false)
    })

    it('should handle birthday edge cases', () => {
      const today = new Date()
      const exactlyTwentyOne = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate())
      
      expect(validateAge(exactlyTwentyOne.toISOString().split('T')[0])).toBe(true)
    })
  })

  describe('validatePhone', () => {
    it('should validate US phone numbers', () => {
      expect(validatePhone('(555) 123-4567')).toBe(true)
      expect(validatePhone('555-123-4567')).toBe(true)
      expect(validatePhone('555.123.4567')).toBe(true)
      expect(validatePhone('5551234567')).toBe(true)
      expect(validatePhone('+1 555 123 4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('555-123-456')).toBe(false)
      expect(validatePhone('abc-def-ghij')).toBe(false)
    })
  })

  describe('validateZipCode', () => {
    it('should validate 5-digit zip codes', () => {
      expect(validateZipCode('12345')).toBe(true)
      expect(validateZipCode('90210')).toBe(true)
    })

    it('should validate ZIP+4 format', () => {
      expect(validateZipCode('12345-6789')).toBe(true)
      expect(validateZipCode('90210-1234')).toBe(true)
    })

    it('should reject invalid zip codes', () => {
      expect(validateZipCode('1234')).toBe(false)
      expect(validateZipCode('123456')).toBe(false)
      expect(validateZipCode('abcde')).toBe(false)
    })
  })

  describe('validateCreditCard', () => {
    it('should validate Visa cards', () => {
      const result = validateCreditCard('4111111111111111')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('visa')
    })

    it('should validate Mastercard', () => {
      const result = validateCreditCard('5555555555554444')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('mastercard')
    })

    it('should validate American Express', () => {
      const result = validateCreditCard('378282246310005')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('amex')
    })

    it('should reject invalid card numbers', () => {
      const result = validateCreditCard('1234567890123456')
      expect(result.isValid).toBe(false)
    })

    it('should handle cards with spaces', () => {
      const result = validateCreditCard('4111 1111 1111 1111')
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('visa')
    })
  })

  describe('validateState', () => {
    it('should validate allowed states', () => {
      expect(validateState('CA')).toBe(true)
      expect(validateState('NY')).toBe(true)
      expect(validateState('TX')).toBe(true)
      expect(validateState('co')).toBe(true) // Case insensitive
    })

    it('should reject restricted states', () => {
      expect(validateState('ID')).toBe(false) // Idaho is restricted
    })

    it('should reject invalid state codes', () => {
      expect(validateState('XX')).toBe(false)
      expect(validateState('ZZ')).toBe(false)
      expect(validateState('')).toBe(false)
    })
  })

  describe('integration scenarios', () => {
    it('should validate complete user registration data', () => {
      const userData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        birthDate: '1990-01-01',
        phone: '555-123-4567',
        zipCode: '12345',
        state: 'CA'
      }

      expect(validateEmail(userData.email)).toBe(true)
      expect(validatePassword(userData.password).isValid).toBe(true)
      expect(validateAge(userData.birthDate)).toBe(true)
      expect(validatePhone(userData.phone)).toBe(true)
      expect(validateZipCode(userData.zipCode)).toBe(true)
      expect(validateState(userData.state)).toBe(true)
    })

    it('should handle checkout validation', () => {
      const checkoutData = {
        email: 'customer@example.com',
        phone: '(555) 987-6543',
        zipCode: '90210-1234',
        state: 'CA',
        creditCard: '4111111111111111'
      }

      expect(validateEmail(checkoutData.email)).toBe(true)
      expect(validatePhone(checkoutData.phone)).toBe(true)
      expect(validateZipCode(checkoutData.zipCode)).toBe(true)
      expect(validateState(checkoutData.state)).toBe(true)
      expect(validateCreditCard(checkoutData.creditCard).isValid).toBe(true)
    })
  })
})
