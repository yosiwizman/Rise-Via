import { describe, it, expect, vi } from 'vitest'

const mockClient = {
  from: vi.fn(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  },
  storage: {
    from: vi.fn()
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient)
}))

describe('Supabase Configuration', () => {
  it('should export supabase client', async () => {
    const { supabase } = await import('../../lib/supabase')
    expect(supabase).toBeDefined()
  })

  it('should have database methods', async () => {
    const { supabase } = await import('../../lib/supabase')
    expect(supabase.from).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should be usable for basic operations', async () => {
    const { supabase } = await import('../../lib/supabase')
    const query = supabase.from('test')
    expect(query).toBeDefined()
  })
})
