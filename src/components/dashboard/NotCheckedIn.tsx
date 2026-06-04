'use client'
import { useMemo } from 'react'
import { Phone, UserCheck } from 'lucide-react'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useAttendance'
import { Skeleton } from '@/components/ui/skeleton'

export function NotCheckedIn() {
  const { allStudents, loading: loadingStudents } = useStudents()
  const { logs, loading: loadingLogs } = useAttendance()
  const loading = loadingStudents || loadingLogs

  const pending = useMemo(() => {
    const checked = new Set(logs.map(l => l.student_id))
    return allStudents.filter(s => !checked.has(s.id))
  }, [allStudents, logs])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    )
  }

  if (allStudents.length > 0 && pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
          <UserCheck className="w-7 h-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">มาครบทุกคนแล้ววันนี้ 🎉</p>
      </div>
    )
  }

  if (allStudents.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีข้อมูลนักเรียน</p>
  }

  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto">
      {pending.map(s => (
        <div key={s.id} className="flex items-center justify-between gap-2 p-2.5 rounded-2xl hover:bg-rose-50/50 dark:hover:bg-gray-800/60 transition-colors">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{s.fullname}</p>
            <p className="text-xs text-gray-400">{s.classroom}</p>
          </div>
          {s.parent_phone && (
            <a
              href={`tel:${s.parent_phone}`}
              className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
              aria-label={`โทรหาผู้ปกครองของ ${s.fullname}`}
            >
              <Phone className="w-3.5 h-3.5" /> โทร
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
