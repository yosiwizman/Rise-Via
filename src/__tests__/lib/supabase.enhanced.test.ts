import { describe, it, expect } from 'vitest'

describe('Supabase Client', () => {
  describe('client initialization', () => {
    it('should export supabase client', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
      expect(supabase.from).toBeDefined()
    })
  })

  describe('authentication methods', () => {
    it('should have auth.getUser method', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase.auth.getUser).toBeDefined()
      expect(typeof supabase.auth.getUser).toBe('function')
    })

    it('should have auth.signInWithPassword method', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase.auth.signInWithPassword).toBeDefined()
      expect(typeof supabase.auth.signInWithPassword).toBe('function')
    })

    it('should have auth.signOut method', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase.auth.signOut).toBeDefined()
      expect(typeof supabase.auth.signOut).toBe('function')
    })

    it('should have auth.onAuthStateChange method', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase.auth.onAuthStateChange).toBeDefined()
      expect(typeof supabase.auth.onAuthStateChange).toBe('function')
    })
  })

  describe('database methods', () => {
    it('should have from method for table queries', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      expect(supabase.from).toBeDefined()
      expect(typeof supabase.from).toBe('function')
    })

    it('should support chained query methods', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      const query = supabase.from('test_table')
      expect(query.select).toBeDefined()
      
      const selectQuery = query.select('*')
      expect(selectQuery.eq).toBeDefined()
    })

    it('should support insert operations', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      const insertQuery = supabase.from('test_table').insert({ test: 'data' })
      expect(insertQuery).toBeDefined()
    })

    it('should support update operations', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      const updateQuery = supabase.from('test_table').update({ test: 'updated' })
      expect(updateQuery).toBeDefined()
    })

    it('should support delete operations', async () => {
      const { supabase } = await import('../../lib/supabase')
      
      const deleteQuery = supabase.from('test_table').delete()
      expect(deleteQuery).toBeDefined()
    })
  })

  describe('environment configuration', () => {
    it('should handle environment variables gracefully', async () => {
      const { supabase } = await import('../../lib/supabase')
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
    })
  })
})
