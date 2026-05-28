import { describe, it, expect } from 'vitest'
import { MOCK_STUDENTS, getMockStats } from '@/lib/mock-data'

describe('mock data', () => {
  it('has 20 students', () => {
    expect(MOCK_STUDENTS).toHaveLength(20)
  })
  it('has 3 classrooms', () => {
    const rooms = [...new Set(MOCK_STUDENTS.map(s => s.classroom))]
    expect(rooms).toHaveLength(3)
  })
  it('getMockStats totals sum to 20', () => {
    const stats = getMockStats()
    expect(stats.present + stats.absent + stats.late).toBe(20)
  })
})
