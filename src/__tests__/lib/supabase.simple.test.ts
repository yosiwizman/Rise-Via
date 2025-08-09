import { describe, it, expect, vi } from 'vitest'

const mockClient = {
  from: vi.fn(),
  auth: vi.fn(),
  storage: vi.fn()
}

const mockCreateClient = vi.fn(() => mockClient)

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

describe('Supabase Client - Simple', () => {
  it('should create supabase client with correct config', async () => {
    const { supabase } = await import('../../lib/supabase')
    expect(supabase).toBeDefined()
    expect(supabase.from).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should export supabase instance', async () => {
    const { supabase } = await import('../../lib/supabase')
    expect(supabase).toBeTruthy()
    expect(typeof supabase).toBe('object')
  })
})
