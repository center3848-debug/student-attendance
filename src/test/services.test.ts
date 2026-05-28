import { describe, it, expect, vi } from 'vitest'

// Must be set before dynamic imports so USE_MOCK evaluates to true
process.env.NEXT_PUBLIC_USE_MOCK = 'true'

vi.mock('@/services/supabase', () => ({
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({ gte: () => ({ lte: () => ({ order: () => ({ data: [], error: null }) }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    }),
  }),
}))

// USE_MOCK=true so real supabase won't be called
describe('attendance service', () => {
  it('getAttendanceByDate returns array (mock mode)', async () => {
    const { getAttendanceByDate } = await import('@/services/attendance')
    const result = await getAttendanceByDate('2026-05-28')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('student service', () => {
  it('getStudents returns array (mock mode)', async () => {
    const { getStudents } = await import('@/services/students')
    const result = await getStudents()
    expect(Array.isArray(result)).toBe(true)
  })
})
