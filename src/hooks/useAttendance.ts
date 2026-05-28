'use client'
import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/services/supabase'
import { getAttendanceByDate, getTodayStats } from '@/services/attendance'
import type { AttendanceLog, DashboardStats } from '@/types'

export function useAttendance(date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0]
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [logsData, statsData] = await Promise.all([
        getAttendanceByDate(today),
        getTodayStats(),
      ])
      setLogs(logsData)
      setStats(statsData)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    load()
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('attendance_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { logs, stats, loading, refresh: load }
}
