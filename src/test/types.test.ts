import { describe, it, expect } from 'vitest'
import type { Student, AttendanceLog } from '@/types'

describe('types', () => {
  it('Student type has required fields', () => {
    const s: Student = {
      id: '1', student_code: 'ST001', fullname: 'สมชาย ใจดี',
      classroom: 'ป.1/1', parent_name: 'นางสาว ใจดี', parent_phone: '0812345678',
      profile_image_url: null, created_at: new Date().toISOString(),
    }
    expect(s.student_code).toBe('ST001')
  })
  it('AttendanceLog check_type is valid', () => {
    const log: AttendanceLog = {
      id: '1', student_id: 'st1', check_type: 'check_in',
      image_url: null, timestamp: new Date().toISOString(),
      device_name: 'iPad', status: 'present',
    }
    expect(log.check_type).toBe('check_in')
  })
})
