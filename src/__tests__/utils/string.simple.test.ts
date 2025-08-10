import { describe, it, expect } from 'vitest'

describe('String Utils', () => {
  it('should capitalize strings', () => {
    const capitalize = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }
    
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('WORLD')).toBe('World')
    expect(capitalize('')).toBe('')
  })

  it('should truncate strings', () => {
    const truncate = (str: string, length: number) => {
      return str.length > length ? str.slice(0, length) + '...' : str
    }
    
    expect(truncate('Hello World', 5)).toBe('Hello...')
    expect(truncate('Hi', 10)).toBe('Hi')
  })

  it('should slugify strings', () => {
    const slugify = (str: string) => {
      return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    }
    
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('Test & Example')).toBe('test--example')
  })

  it('should check if string is empty', () => {
    const isEmpty = (str: string) => {
      return !str || str.trim().length === 0
    }
    
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
    expect(isEmpty('hello')).toBe(false)
  })
})
