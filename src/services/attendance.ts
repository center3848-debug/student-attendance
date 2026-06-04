import { createBrowserClient } from './supabase'
import type { AttendanceLog, CheckType, AttendanceStatus } from '@/types'

export async function getAttendanceByDate(date: string): Promise<AttendanceLog[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, student:students(*)')
    .gte('timestamp', `${date}T00:00:00Z`)
    .lte('timestamp', `${date}T23:59:59Z`)
    .order('timestamp', { ascending: false })
  if (error) { console.error('getAttendanceByDate:', error.message); return [] }
  return (data ?? []) as AttendanceLog[]
}

export async function getAttendanceRange(startISO: string, endISO: string): Promise<AttendanceLog[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, student:students(*)')
    .gte('timestamp', startISO)
    .lte('timestamp', endISO)
    .order('timestamp', { ascending: false })
  if (error) { console.error('getAttendanceRange:', error.message); return [] }
  return (data ?? []) as AttendanceLog[]
}

export async function getAttendanceByStudent(studentId: string, limit = 90): Promise<AttendanceLog[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, student:students(*)')
    .eq('student_id', studentId)
    .order('timestamp', { ascending: false })
    .limit(limit)
  if (error) { console.error('getAttendanceByStudent:', error.message); return [] }
  return (data ?? []) as AttendanceLog[]
}

export async function createAttendanceLog(payload: {
  student_id: string
  check_type: CheckType
  image_url: string | null
  device_name: string
  status: AttendanceStatus
}): Promise<AttendanceLog> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs').insert(payload).select('*, student:students(*)').single()
  if (error) throw error
  return data as AttendanceLog
}

export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const supabase = createBrowserClient()
  const [logs, { count }] = await Promise.all([
    getAttendanceByDate(today),
    supabase.from('students').select('*', { count: 'exact', head: true }),
  ])
  // Count distinct students per status (a student may have several check types in a day).
  const distinct = (status: AttendanceStatus) =>
    new Set(logs.filter(l => l.status === status).map(l => l.student_id)).size
  const total = count ?? 0
  const present = distinct('present')
  const late = distinct('late')
  // "ไม่ได้เช็ค = ขาด" — but only once the day is in session (someone has checked).
  const absent = logs.length > 0 ? Math.max(0, total - present - late) : 0
  return { total, present, absent, late, date: today }
}
