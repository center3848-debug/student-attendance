import { describe, it, expect } from 'vitest'
import { rangeDays, dailyBars, summarizeStudents, sessionDayKeys, isEmptyBars } from '@/lib/reports'
import type { AttendanceLog, Student } from '@/types'

function student(id: string, classroom = 'ห้อง 1', created = '2026-01-01T00:00:00Z'): Student {
  return { id, student_code: id, fullname: `เด็ก ${id}`, classroom, parent_name: '', parent_phone: '', profile_image_url: null, created_at: created }
}

function log(id: string, student_id: string, ts: string, status: AttendanceLog['status'] = 'present', check_type: AttendanceLog['check_type'] = 'check_in'): AttendanceLog {
  return { id, student_id, check_type, image_url: null, timestamp: ts, device_name: 'test', status }
}

const students = [student('s1'), student('s2'), student('s3')]

describe('rangeDays', () => {
  it('today → single day', () => {
    const days = rangeDays('today', new Date('2026-05-28T10:00:00Z'))
    expect(days).toHaveLength(1)
    expect(days[0].key).toBe('2026-05-28')
  })
  it('week → 7 days oldest first', () => {
    const days = rangeDays('week', new Date('2026-05-28T10:00:00Z'))
    expect(days).toHaveLength(7)
    expect(days[0].key).toBe('2026-05-22')
    expect(days[6].key).toBe('2026-05-28')
  })
  it('month → 30 days', () => {
    expect(rangeDays('month', new Date('2026-05-28T10:00:00Z'))).toHaveLength(30)
  })
})

describe('sessionDayKeys', () => {
  it('only includes days that have at least one log', () => {
    const days = [{ key: '2026-05-27' }, { key: '2026-05-28' }]
    const logs = [log('l1', 's1', '2026-05-28T01:00:00Z')]
    expect(sessionDayKeys(logs, days)).toEqual(['2026-05-28'])
  })
})

describe('dailyBars', () => {
  it('present = distinct students; multiple checks same day count once', () => {
    const days = [{ label: 'พ', key: '2026-05-28' }]
    const logs = [
      log('l1', 's1', '2026-05-28T01:00:00Z', 'present', 'check_in'),
      log('l2', 's1', '2026-05-28T09:00:00Z', 'present', 'pickup'),
      log('l3', 's2', '2026-05-28T02:00:00Z', 'present', 'check_in'),
    ]
    const bars = dailyBars(logs, days, students)
    expect(bars[0].มาเรียน).toBe(2)
  })

  it('on an active day, enrolled-but-not-checked = absent', () => {
    const days = [{ label: 'พ', key: '2026-05-28' }]
    const logs = [log('l1', 's1', '2026-05-28T01:00:00Z')] // s2, s3 not checked
    const bars = dailyBars(logs, days, students)
    expect(bars[0].มาเรียน).toBe(1)
    expect(bars[0].ขาดเรียน).toBe(2)
  })

  it('a day with no activity reports zero absences (not mass-absence)', () => {
    const days = [{ label: 'อ', key: '2026-05-26' }, { label: 'พ', key: '2026-05-28' }]
    const logs = [log('l1', 's1', '2026-05-28T01:00:00Z')]
    const bars = dailyBars(logs, days, students)
    expect(bars[0]).toMatchObject({ มาเรียน: 0, ขาดเรียน: 0, มาสาย: 0 }) // 26th: no data
    expect(bars[1].ขาดเรียน).toBe(2) // 28th: active
  })

  it('students enrolled after the day are not counted absent', () => {
    const days = [{ label: 'พ', key: '2026-05-28' }]
    const late = [student('s1'), student('s2', 'ห้อง 1', '2026-06-01T00:00:00Z')] // s2 enrolled later
    const logs = [log('l1', 's1', '2026-05-28T01:00:00Z')]
    const bars = dailyBars(logs, days, late)
    expect(bars[0].ขาดเรียน).toBe(0) // s2 not yet enrolled, s1 present
  })
})

describe('summarizeStudents', () => {
  it('counts present/absent over session days and computes rate', () => {
    const days = [{ key: '2026-05-27' }, { key: '2026-05-28' }]
    const logs = [
      log('l1', 's1', '2026-05-27T01:00:00Z'),
      log('l2', 's1', '2026-05-28T01:00:00Z'),
      log('l3', 's2', '2026-05-28T01:00:00Z'), // s2 absent on 27th (active day), present 28th
    ]
    const rows = summarizeStudents(students, logs, days)
    const s1 = rows.find(r => r.id === 's1')!
    expect(s1).toMatchObject({ present: 2, absent: 0, rate: 100 })
    const s2 = rows.find(r => r.id === 's2')!
    expect(s2).toMatchObject({ present: 1, absent: 1, rate: 50 })
    const s3 = rows.find(r => r.id === 's3')!
    expect(s3).toMatchObject({ present: 0, absent: 2, rate: 0 })
  })
})

describe('isEmptyBars', () => {
  it('true when all zero', () => {
    expect(isEmptyBars([{ day: 'จ', มาเรียน: 0, ขาดเรียน: 0, มาสาย: 0 }])).toBe(true)
  })
  it('false when any value', () => {
    expect(isEmptyBars([{ day: 'จ', มาเรียน: 1, ขาดเรียน: 0, มาสาย: 0 }])).toBe(false)
  })
})
