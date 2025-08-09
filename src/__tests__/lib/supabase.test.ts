import { describe, it, expect, vi } from 'vitest'
import { supabase } from '../../lib/supabase'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  }))
}))

describe('supabase', () => {
  it('should create supabase client', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.from).toBeDefined()
  })

  it('should have auth methods', () => {
    expect(supabase.auth.getUser).toBeDefined()
    expect(supabase.auth.signInWithPassword).toBeDefined()
    expect(supabase.auth.signOut).toBeDefined()
    expect(supabase.auth.onAuthStateChange).toBeDefined()
  })

  it('should have database methods', () => {
    const table = supabase.from('test')
    expect(table.select).toBeDefined()
    expect(table.insert).toBeDefined()
    expect(table.update).toBeDefined()
    expect(table.delete).toBeDefined()
  })

  it('should support query chaining', () => {
    const query = supabase.from('test').select('*').eq('id', 1).single()
    expect(query).toBeDefined()
  })
})
