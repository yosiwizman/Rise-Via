import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ImageOptimizer } from '../../utils/imageOptimization'

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com'
  }
})

Object.defineProperty(window, 'devicePixelRatio', {
  value: 2
})

global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src: string = ''
  height: number = 0

  constructor() {
    setTimeout(() => {
      if (this.src.includes('webp')) {
        this.height = 2 // WebP support test
      }
      this.onload?.()
    }, 0)
  }
} as any

const mockContext = {
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  fillRect: vi.fn(),
  fillStyle: ''
}

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockContext),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock-data')
}

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tag: string) => {
    if (tag === 'canvas') return mockCanvas
    return {}
  })
})

describe('ImageOptimizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSrcSet', () => {
    it('should generate srcSet for default breakpoints', () => {
      const baseUrl = 'https://example.com/image.jpg'
      
      const result = ImageOptimizer.generateSrcSet(baseUrl)
      
      expect(result).toContain('320w')
      expect(result).toContain('480w')
      expect(result).toContain('768w')
      expect(result).toContain('1024w')
      expect(result).toContain('1200w')
      expect(result).toContain('1920w')
    })

    it('should generate srcSet for custom sizes', () => {
      const baseUrl = 'https://example.com/image.jpg'
      const customSizes = [400, 800, 1200]
      
      const result = ImageOptimizer.generateSrcSet(baseUrl, customSizes)
      
      expect(result).toContain('400w')
      expect(result).toContain('800w')
      expect(result).toContain('1200w')
      expect(result).not.toContain('320w')
    })

    it('should include optimized URLs', () => {
      const baseUrl = 'https://example.com/image.jpg'
      
      const result = ImageOptimizer.generateSrcSet(baseUrl, [400])
      
      expect(result).toContain('w=400')
      expect(result).toContain('q=75')
    })
  })

  describe('getOptimizedImageSources', () => {
    it('should return WebP and fallback sources', () => {
      const baseUrl = 'https://example.com/image.jpg'
      const sizes = [400, 800]
      
      const result = ImageOptimizer.getOptimizedImageSources(baseUrl, sizes)
      
      expect(result.webp).toHaveLength(2)
      expect(result.fallback).toHaveLength(2)
      
      expect(result.webp[0].type).toBe('image/webp')
      expect(result.fallback[0].type).toBe('image/jpeg')
      
      expect(result.webp[0].width).toBe(400)
      expect(result.fallback[0].width).toBe(400)
    })

    it('should include format parameters in URLs', () => {
      const baseUrl = 'https://example.com/image.jpg'
      
      const result = ImageOptimizer.getOptimizedImageSources(baseUrl, [400])
      
      expect(result.webp[0].src).toContain('f=webp')
      expect(result.fallback[0].src).toContain('f=jpg')
    })
  })

  describe('loadProgressiveImage', () => {
    it('should load both low and high quality images', async () => {
      const lowQualityUrl = 'https://example.com/low.jpg'
      const highQualityUrl = 'https://example.com/high.jpg'
      const onProgress = vi.fn()
      
      const result = await ImageOptimizer.loadProgressiveImage(
        lowQualityUrl,
        highQualityUrl,
        onProgress
      )
      
      expect(result.lowQuality).toBeInstanceOf(Image)
      expect(result.highQuality).toBeInstanceOf(Image)
      expect(onProgress).toHaveBeenCalledWith('loading')
      expect(onProgress).toHaveBeenCalledWith('low-quality')
      expect(onProgress).toHaveBeenCalledWith('high-quality')
    })

    it('should work without progress callback', async () => {
      const lowQualityUrl = 'https://example.com/low.jpg'
      const highQualityUrl = 'https://example.com/high.jpg'
      
      const result = await ImageOptimizer.loadProgressiveImage(
        lowQualityUrl,
        highQualityUrl
      )
      
      expect(result.lowQuality).toBeInstanceOf(Image)
      expect(result.highQuality).toBeInstanceOf(Image)
    })
  })

  describe('generateBlurPlaceholder', () => {
    it('should generate blur placeholder data URL', () => {
      const result = ImageOptimizer.generateBlurPlaceholder(40, 40)
      
      expect(result).toBe('data:image/jpeg;base64,mock-data')
      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockContext.createLinearGradient).toHaveBeenCalled()
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 40, 40)
    })

    it('should handle missing context', () => {
      mockCanvas.getContext.mockReturnValueOnce(null as any)
      
      const result = ImageOptimizer.generateBlurPlaceholder()
      
      expect(result).toBe('')
    })

    it('should use default dimensions', () => {
      ImageOptimizer.generateBlurPlaceholder()
      
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 40, 40)
    })
  })

  describe('supportsWebP', () => {
    it('should detect WebP support', async () => {
      const result = await ImageOptimizer.supportsWebP()
      
      expect(result).toBe(true)
    })
  })

  describe('createLazyLoadObserver', () => {
    it('should create intersection observer with default options', () => {
      const callback = vi.fn()
      
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
      
      global.IntersectionObserver = vi.fn().mockImplementation((_cb, options) => {
        expect(options.rootMargin).toBe('50px')
        expect(options.threshold).toBe(0.1)
        return mockObserver
      })
      
      const observer = ImageOptimizer.createLazyLoadObserver(callback)
      
      expect(observer).toBe(mockObserver)
      expect(global.IntersectionObserver).toHaveBeenCalled()
    })

    it('should accept custom options', () => {
      const callback = vi.fn()
      const customOptions = {
        rootMargin: '100px',
        threshold: 0.5
      }
      
      global.IntersectionObserver = vi.fn().mockImplementation((_cb, options) => {
        expect(options.rootMargin).toBe('100px')
        expect(options.threshold).toBe(0.5)
        return {}
      })
      
      ImageOptimizer.createLazyLoadObserver(callback, customOptions)
      
      expect(global.IntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('preloadImages', () => {
    it('should preload multiple images', async () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]
      
      const result = await ImageOptimizer.preloadImages(urls)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Image)
      expect(result[1]).toBeInstanceOf(Image)
    })

    it('should handle empty array', async () => {
      const result = await ImageOptimizer.preloadImages([])
      
      expect(result).toHaveLength(0)
    })
  })

  describe('calculateOptimalSize', () => {
    it('should calculate optimal dimensions', () => {
      const result = ImageOptimizer.calculateOptimalSize(
        400,  // container width
        300,  // container height
        1.5,  // aspect ratio
        2     // device pixel ratio
      )
      
      expect(result.width).toBeGreaterThan(400)
      expect(result.height).toBeGreaterThan(0)
    })

    it('should use device pixel ratio from window', () => {
      const result = ImageOptimizer.calculateOptimalSize(400, 300, 1.5)
      
      expect(result.width).toBeGreaterThan(400)
    })

    it('should find appropriate breakpoint', () => {
      const result = ImageOptimizer.calculateOptimalSize(300, 200, 1.5, 1)
      
      expect(result.width).toBe(320)
    })

    it('should use largest breakpoint for very large containers', () => {
      const result = ImageOptimizer.calculateOptimalSize(2500, 1500, 1.5, 1)
      
      expect(result.width).toBe(1920)
    })
  })

  describe('error handling', () => {
    it('should handle invalid URLs gracefully', () => {
      const result = ImageOptimizer.generateSrcSet('invalid-url', [400])
      
      expect(result).toContain('invalid-url')
    })

    it('should handle empty base URL', () => {
      const result = ImageOptimizer.generateSrcSet('', [400])
      
      expect(result).toBe(' 400w')
    })

    it('should handle null base URL', () => {
      const result = ImageOptimizer.generateSrcSet(null as any, [400])
      
      expect(result).toBe(' 400w')
    })
  })
})
