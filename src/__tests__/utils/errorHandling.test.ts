import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorHandler, ErrorInfo } from '../../utils/errorHandling'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-agent',
    onLine: true
  }
})

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('[]')
    console.error = vi.fn()
    console.warn = vi.fn()
    console.log = vi.fn()
  })

  describe('handleError', () => {
    it('should handle basic errors', () => {
      const error = new Error('Test error')
      const errorInfo: ErrorInfo = {
        componentStack: 'test stack'
      }

      ErrorHandler.handleError(error, errorInfo, { userId: 'test-user' })

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should log errors in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Dev error')
      ErrorHandler.handleError(error)

      expect(console.error).toHaveBeenCalledWith('Error caught by ErrorHandler:', error)

      process.env.NODE_ENV = originalEnv
    })

    it('should include context in error details', () => {
      const error = new Error('Context error')
      const context = { feature: 'cart', action: 'add-item' }

      ErrorHandler.handleError(error, undefined, context)

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const successFn = vi.fn().mockResolvedValue('success')

      const result = await ErrorHandler.retryWithBackoff(successFn)

      expect(result).toBe('success')
      expect(successFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0
      const retryFn = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) throw new Error('Temporary failure')
        return Promise.resolve('success')
      })

      const result = await ErrorHandler.retryWithBackoff(retryFn, 3)

      expect(result).toBe('success')
      expect(retryFn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      await expect(ErrorHandler.retryWithBackoff(failFn, 2)).rejects.toThrow('Persistent failure')
      expect(failFn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })
  })

  describe('withFallback', () => {
    it('should return primary result when successful', () => {
      const primaryFn = vi.fn().mockReturnValue('primary')
      const fallbackFn = vi.fn().mockReturnValue('fallback')

      const result = ErrorHandler.withFallback(primaryFn, fallbackFn)

      expect(result).toBe('primary')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).not.toHaveBeenCalled()
    })

    it('should return fallback when primary fails', () => {
      const primaryFn = vi.fn().mockImplementation(() => {
        throw new Error('Primary failed')
      })
      const fallbackFn = vi.fn().mockReturnValue('fallback')

      const result = ErrorHandler.withFallback(primaryFn, fallbackFn)

      expect(result).toBe('fallback')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).toHaveBeenCalled()
    })

    it('should call error handler when provided', () => {
      const errorHandler = vi.fn()
      const primaryFn = vi.fn().mockImplementation(() => {
        throw new Error('Primary failed')
      })
      const fallbackFn = vi.fn().mockReturnValue('fallback')

      ErrorHandler.withFallback(primaryFn, fallbackFn, errorHandler)

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('withAsyncFallback', () => {
    it('should return primary result when successful', async () => {
      const primaryFn = vi.fn().mockResolvedValue('primary')
      const fallbackFn = vi.fn().mockResolvedValue('fallback')

      const result = await ErrorHandler.withAsyncFallback(primaryFn, fallbackFn)

      expect(result).toBe('primary')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).not.toHaveBeenCalled()
    })

    it('should return fallback when primary fails', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'))
      const fallbackFn = vi.fn().mockResolvedValue('fallback')

      const result = await ErrorHandler.withAsyncFallback(primaryFn, fallbackFn)

      expect(result).toBe('fallback')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).toHaveBeenCalled()
    })
  })

  describe('getStoredErrors', () => {
    it('should return stored errors', () => {
      const mockErrors = [{ message: 'test', timestamp: Date.now() }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors))

      const errors = ErrorHandler.getStoredErrors()

      expect(errors).toEqual(mockErrors)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('error_logs')
    })

    it('should return empty array when no errors stored', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const errors = ErrorHandler.getStoredErrors()

      expect(errors).toEqual([])
    })

    it('should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const errors = ErrorHandler.getStoredErrors()

      expect(errors).toEqual([])
    })
  })

  describe('clearStoredErrors', () => {
    it('should remove error logs from localStorage', () => {
      ErrorHandler.clearStoredErrors()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('error_logs')
    })
  })

  describe('handleNetworkError', () => {
    it('should handle network errors with context', () => {
      const error = new Error('Network failed')
      const url = 'https://api.example.com/data'

      ErrorHandler.handleNetworkError(error, url, 'POST')

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('handleAPIError', () => {
    it('should handle API errors with status code', () => {
      const error = new Error('API failed')
      const endpoint = '/api/products'
      const statusCode = 500
      const responseData = { error: 'Internal server error' }

      ErrorHandler.handleAPIError(error, endpoint, statusCode, responseData)

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('handleComponentError', () => {
    it('should handle React component errors', () => {
      const error = new Error('Component failed')
      const errorInfo: ErrorInfo = {
        componentStack: 'at ProductCard\n  at ShopPage'
      }

      ErrorHandler.handleComponentError(error, errorInfo)

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
