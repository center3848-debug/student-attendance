import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/supabase', () => ({
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({
        gte: () => ({ lte: () => ({ order: () => ({ data: [], error: null }) }) }),
        order: () => ({ order: () => ({ data: [], error: null }) }),
      }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    }),
  }),
}))

describe('attendance service', () => {
  it('getAttendanceByDate returns array', async () => {
    const { getAttendanceByDate } = await import('@/services/attendance')
    const result = await getAttendanceByDate('2026-05-28')
    expect(Array.isArray(result)).toBe(true)
  })

  it('getAttendanceRange returns array', async () => {
    const { getAttendanceRange } = await import('@/services/attendance')
    const result = await getAttendanceRange('2026-05-21T00:00:00Z', '2026-05-28T23:59:59Z')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('student service', () => {
  it('getStudents returns array', async () => {
    const { getStudents } = await import('@/services/students')
    const result = await getStudents()
    expect(Array.isArray(result)).toBe(true)
  })
})
