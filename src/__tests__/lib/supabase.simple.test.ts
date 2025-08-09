import { describe, it, expect, vi } from 'vitest'

const mockCreateClient = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

describe('Supabase Client - Simple', () => {
  it('should create supabase client with correct config', async () => {
    const mockClient = { from: vi.fn(), auth: vi.fn() }
    mockCreateClient.mockReturnValue(mockClient)
    
    const { supabase } = await import('../../lib/supabase')
    expect(supabase).toBeDefined()
    expect(mockCreateClient).toHaveBeenCalled()
  })

  it('should export supabase instance', async () => {
    const { supabase } = await import('../../lib/supabase')
    expect(supabase).toBeTruthy()
  })
})
