import { describe, it, expect } from 'vitest'
import { createBrowserClient } from '@/services/supabase'

describe('supabase client', () => {
  it('createBrowserClient returns object with from()', () => {
    const client = createBrowserClient()
    expect(typeof client.from).toBe('function')
  })
})
