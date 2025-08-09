import { describe, it, expect } from 'vitest'

describe('Array Utils', () => {
  it('should remove duplicates from array', () => {
    const removeDuplicates = <T>(arr: T[]) => {
      return [...new Set(arr)]
    }
    
    expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    expect(removeDuplicates(['a', 'b', 'a'])).toEqual(['a', 'b'])
  })

  it('should chunk arrays', () => {
    const chunk = <T>(arr: T[], size: number) => {
      const chunks: T[][] = []
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
      }
      return chunks
    }
    
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]])
  })

  it('should shuffle arrays', () => {
    const shuffle = <T>(arr: T[]) => {
      const shuffled = [...arr]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffle(original)
    
    expect(shuffled).toHaveLength(original.length)
    expect(shuffled.sort()).toEqual(original.sort())
  })
})
