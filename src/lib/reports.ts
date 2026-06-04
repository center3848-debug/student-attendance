import type { AttendanceLog, AttendanceStatus, Student } from '@/types'

export type ReportRange = 'today' | 'week' | 'month'

export interface DayBar {
  day: string
  มาเรียน: number
  ขาดเรียน: number
  มาสาย: number
}

export interface StudentSummaryRow {
  id: string
  name: string
  classroom: string
  present: number
  absent: number
  late: number
  rate: number
}

const TH_WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์']

/** ISO date (YYYY-MM-DD, UTC) — matches how the rest of the app keys dates */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const dayOf = (l: AttendanceLog) => l.timestamp.slice(0, 10)
const enrollOf = (s: Student) => s.created_at.slice(0, 10)

/**
 * Calendar days that make up a report range, oldest → newest.
 * - today: a single day labelled "วันนี้"
 * - week:  last 7 days, labelled by Thai weekday
 * - month: last 30 days, labelled by day-of-month
 */
export function rangeDays(range: ReportRange, now: Date = new Date()): { label: string; key: string }[] {
  if (range === 'today') return [{ label: 'วันนี้', key: isoDate(now) }]
  const n = range === 'week' ? 7 : 30
  const days: { label: string; key: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    days.push({
      label: range === 'week' ? TH_WEEKDAYS[d.getUTCDay()] : String(d.getUTCDate()),
      key: isoDate(d),
    })
  }
  return days
}

/**
 * Days (from the given range) that the centre was actually "in session" —
 * i.e. at least one student was checked. Days with no logs are treated as
 * "no data", never as a mass-absence day.
 */
export function sessionDayKeys(logs: AttendanceLog[], days: { key: string }[]): string[] {
  const withLogs = new Set(logs.map(dayOf))
  return days.map(d => d.key).filter(k => withLogs.has(k))
}

/**
 * One bar per day. On a day with activity, "ขาด" = enrolled students who were
 * neither present nor late (rule: "ไม่ได้เช็ค = ขาด"). Days with no activity
 * report zero absences. Students are not counted absent before they were added.
 */
export function dailyBars(logs: AttendanceLog[], days: { label: string; key: string }[], students: Student[]): DayBar[] {
  return days.map(({ label, key }) => {
    const dayLogs = logs.filter(l => dayOf(l) === key)
    const presentSet = new Set(dayLogs.filter(l => l.status === 'present').map(l => l.student_id))
    const lateSet = new Set(dayLogs.filter(l => l.status === 'late').map(l => l.student_id))
    let absent = 0
    if (dayLogs.length > 0) {
      absent = students.filter(s =>
        enrollOf(s) <= key && !presentSet.has(s.id) && !lateSet.has(s.id)
      ).length
    }
    return { day: label, มาเรียน: presentSet.size, ขาดเรียน: absent, มาสาย: lateSet.size }
  })
}

/**
 * Per-student summary over the range. Counts only "in session" days
 * (≥1 check that day) and only days on/after the student was enrolled.
 * rate = present ÷ (present + absent + late).
 */
export function summarizeStudents(students: Student[], logs: AttendanceLog[], days: { key: string }[]): StudentSummaryRow[] {
  const sessionKeys = sessionDayKeys(logs, days)
  return students.map(s => {
    const enroll = enrollOf(s)
    let present = 0, late = 0, absent = 0
    for (const key of sessionKeys) {
      if (key < enroll) continue
      const dayLogs = logs.filter(l => l.student_id === s.id && dayOf(l) === key)
      if (dayLogs.some(l => l.status === 'present')) present++
      else if (dayLogs.some(l => l.status === 'late')) late++
      else absent++
    }
    const total = present + late + absent
    return {
      id: s.id,
      name: s.fullname,
      classroom: s.classroom,
      present,
      absent,
      late,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  })
}

/** True when every bar is empty — lets the UI show an empty state instead of a flat chart. */
export function isEmptyBars(bars: DayBar[]): boolean {
  return bars.every(b => b.มาเรียน === 0 && b.ขาดเรียน === 0 && b.มาสาย === 0)
}
