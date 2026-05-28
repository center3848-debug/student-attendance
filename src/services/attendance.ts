import { createBrowserClient } from './supabase'
import type { AttendanceLog, CheckType, AttendanceStatus } from '@/types'
import { MOCK_ATTENDANCE_LOGS } from '@/lib/mock-data'

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function getAttendanceByDate(date: string): Promise<AttendanceLog[]> {
  if (USE_MOCK) return MOCK_ATTENDANCE_LOGS
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, student:students(*)')
    .gte('timestamp', `${date}T00:00:00Z`)
    .lte('timestamp', `${date}T23:59:59Z`)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data as AttendanceLog[]
}

export async function createAttendanceLog(payload: {
  student_id: string
  check_type: CheckType
  image_url: string | null
  device_name: string
  status: AttendanceStatus
}): Promise<AttendanceLog> {
  if (USE_MOCK) {
    return { id: crypto.randomUUID(), ...payload, timestamp: new Date().toISOString() } as AttendanceLog
  }
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs').insert(payload).select('*, student:students(*)').single()
  if (error) throw error
  return data as AttendanceLog
}

export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const logs = await getAttendanceByDate(today)
  return {
    total: logs.length,
    present: logs.filter(l => l.status === 'present').length,
    absent: logs.filter(l => l.status === 'absent').length,
    late: logs.filter(l => l.status === 'late').length,
    date: today,
  }
}
