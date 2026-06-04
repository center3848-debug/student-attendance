'use client'
import { useEffect, useState } from 'react'
import { getAttendanceRange } from '@/services/attendance'
import { getStudents } from '@/services/students'
import { rangeDays, type ReportRange } from '@/lib/reports'
import type { AttendanceLog, Student } from '@/types'

/** Loads students + attendance logs for a report range (today / week / month). */
export function useAttendanceReport(range: ReportRange) {
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const days = rangeDays(range)
    const start = `${days[0].key}T00:00:00Z`
    const end = `${days[days.length - 1].key}T23:59:59Z`
    Promise.all([getAttendanceRange(start, end), getStudents()])
      .then(([logsData, studentsData]) => {
        if (active) { setLogs(logsData); setStudents(studentsData) }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [range])

  return { logs, students, loading }
}
