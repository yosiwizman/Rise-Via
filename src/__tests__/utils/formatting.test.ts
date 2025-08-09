import { describe, it, expect } from 'vitest'

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} at ${formatTime(date)}`
}

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

const formatZipCode = (zip: string): string => {
  const cleaned = zip.replace(/\D/g, '')
  if (cleaned.length === 5) {
    return cleaned
  }
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return zip
}

const formatCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '')
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length < 4) return cardNumber
  return '**** **** **** ' + cleaned.slice(-4)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

const formatWeight = (grams: number): string => {
  if (grams < 1000) {
    return `${grams}g`
  }
  return `${(grams / 1000).toFixed(1)}kg`
}

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const capitalizeWords = (text: string): string => {
  return text.split(' ').map(word => capitalizeFirst(word)).join(' ')
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(29.99)).toBe('$29.99')
      expect(formatCurrency(100)).toBe('$100.00')
    })

    it('should format different currencies', () => {
      expect(formatCurrency(29.99, 'EUR')).toBe('€29.99')
      expect(formatCurrency(29.99, 'GBP')).toBe('£29.99')
    })

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default 1 decimal', () => {
      expect(formatPercentage(22.5)).toBe('22.5%')
      expect(formatPercentage(100)).toBe('100.0%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(22.567, 2)).toBe('22.57%')
      expect(formatPercentage(22.567, 0)).toBe('23%')
    })

    it('should handle zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })
  })

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toBe('December 25, 2023')
    })

    it('should format date string', () => {
      expect(formatDate('2023-12-25')).toBe('December 25, 2023')
    })

    it('should handle different date formats', () => {
      expect(formatDate('2023-01-01')).toBe('January 1, 2023')
    })
  })

  describe('formatTime', () => {
    it('should format time from Date object', () => {
      const date = new Date('2023-12-25T14:30:00')
      expect(formatTime(date)).toBe('02:30 PM')
    })

    it('should format time from string', () => {
      expect(formatTime('2023-12-25T09:15:00')).toBe('09:15 AM')
    })
  })

  describe('formatDateTime', () => {
    it('should combine date and time formatting', () => {
      const date = new Date('2023-12-25T14:30:00')
      expect(formatDateTime(date)).toBe('December 25, 2023 at 02:30 PM')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
    })

    it('should format 11-digit phone numbers with country code', () => {
      expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('555123456789')).toBe('555123456789')
    })
  })

  describe('formatZipCode', () => {
    it('should format 5-digit zip codes', () => {
      expect(formatZipCode('12345')).toBe('12345')
      expect(formatZipCode('1-2-3-4-5')).toBe('12345')
    })

    it('should format 9-digit zip codes', () => {
      expect(formatZipCode('123456789')).toBe('12345-6789')
    })

    it('should return original for invalid formats', () => {
      expect(formatZipCode('123')).toBe('123')
      expect(formatZipCode('abcde')).toBe('abcde')
    })
  })

  describe('formatCreditCard', () => {
    it('should add spaces every 4 digits', () => {
      expect(formatCreditCard('1234567890123456')).toBe('1234 5678 9012 3456')
      expect(formatCreditCard('1234 5678 9012 3456')).toBe('1234 5678 9012 3456')
    })

    it('should handle shorter card numbers', () => {
      expect(formatCreditCard('123456789012345')).toBe('1234 5678 9012 345')
    })
  })

  describe('maskCreditCard', () => {
    it('should mask all but last 4 digits', () => {
      expect(maskCreditCard('1234567890123456')).toBe('**** **** **** 3456')
      expect(maskCreditCard('1234 5678 9012 3456')).toBe('**** **** **** 3456')
    })

    it('should return original for short numbers', () => {
      expect(maskCreditCard('123')).toBe('123')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(512)).toBe('512 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(59)).toBe('59s')
    })

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(3599)).toBe('59m 59s')
    })

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3661)).toBe('1h 1m 1s')
      expect(formatDuration(7200)).toBe('2h 0m 0s')
    })
  })

  describe('formatWeight', () => {
    it('should format grams', () => {
      expect(formatWeight(500)).toBe('500g')
      expect(formatWeight(999)).toBe('999g')
    })

    it('should format kilograms', () => {
      expect(formatWeight(1000)).toBe('1.0kg')
      expect(formatWeight(1500)).toBe('1.5kg')
    })
  })

  describe('formatDistance', () => {
    it('should format meters', () => {
      expect(formatDistance(500)).toBe('500m')
      expect(formatDistance(999)).toBe('999m')
    })

    it('should format kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0km')
      expect(formatDistance(1500)).toBe('1.5km')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...')
    })

    it('should return original if within limit', () => {
      expect(truncateText('Short text', 20)).toBe('Short text')
    })

    it('should handle exact length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact')
    })
  })

  describe('capitalizeFirst', () => {
    it('should capitalize first letter only', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
      expect(capitalizeFirst('HELLO')).toBe('Hello')
      expect(capitalizeFirst('hELLO')).toBe('Hello')
    })

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A')
    })

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('')
    })
  })

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World')
    })

    it('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello')
    })

    it('should handle multiple spaces', () => {
      expect(capitalizeWords('hello  world')).toBe('Hello  World')
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Blue Dream Strain')).toBe('blue-dream-strain')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
      expect(slugify('Test@#$%^&*()')).toBe('test')
    })

    it('should handle multiple spaces and dashes', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
      expect(slugify('Hello---World')).toBe('hello-world')
    })

    it('should remove leading and trailing dashes', () => {
      expect(slugify('-Hello World-')).toBe('hello-world')
    })
  })
})
