import { describe, it, expect } from 'vitest'
import { resolveStatus, LATE_CUTOFF } from '@/lib/attendance-status'

function at(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

describe('resolveStatus', () => {
  it('cutoff is 09:00', () => {
    expect(LATE_CUTOFF).toBe('09:00')
  })
  it('check_in before cutoff = present', () => {
    expect(resolveStatus('check_in', at('08:45'))).toBe('present')
  })
  it('check_in after cutoff = late', () => {
    expect(resolveStatus('check_in', at('09:15'))).toBe('late')
  })
  it('check_out and pickup are always present (never late)', () => {
    expect(resolveStatus('check_out', at('17:00'))).toBe('present')
    expect(resolveStatus('pickup', at('18:00'))).toBe('present')
  })
})
