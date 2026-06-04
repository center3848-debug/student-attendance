import type { AttendanceStatus, CheckType } from '@/types'

/**
 * Check-ins after this local time are marked "สาย" (late).
 * Override with NEXT_PUBLIC_LATE_CUTOFF (format "HH:MM"). Default 09:00.
 */
export const LATE_CUTOFF = process.env.NEXT_PUBLIC_LATE_CUTOFF || '09:00'

/**
 * Resolve the attendance status of a check at `now`.
 * Only "check_in" can be late; check-out / pickup are always recorded as present.
 */
export function resolveStatus(checkType: CheckType, now: Date = new Date()): AttendanceStatus {
  if (checkType !== 'check_in') return 'present'
  const [h, m] = LATE_CUTOFF.split(':').map(Number)
  const cutoff = new Date(now)
  cutoff.setHours(h, m ?? 0, 0, 0)
  return now.getTime() > cutoff.getTime() ? 'late' : 'present'
}
