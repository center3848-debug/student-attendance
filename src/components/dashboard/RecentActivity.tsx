'use client'
import { useAttendance } from '@/hooks/useAttendance'
import { StatusBadge } from '@/components/attendance/StatusBadge'
import { formatThaiTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList } from 'lucide-react'

const checkLabel: Record<string, string> = {
  check_in: 'เข้าเรียน',
  check_out: 'ออกจากศูนย์',
  pickup: 'รับกลับบ้าน',
}

const avatarGrads = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

function isRecent(timestamp: string) {
  return Date.now() - new Date(timestamp).getTime() < 5 * 60 * 1000
}

export function RecentActivity() {
  const { logs, loading } = useAttendance()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-9 h-9 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <div className="w-14 h-14 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <ClipboardList className="w-7 h-7 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">ยังไม่มีการลงเวลาวันนี้</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">รอเด็กๆ มาถึงโรงเรียน</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-72 overflow-y-auto">
      {logs.slice(0, 10).map((log, i) => {
        const recent = isRecent(log.timestamp)
        return (
          <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-blue-50/60 dark:hover:bg-gray-800/60 transition-all duration-200">
            <div className={`w-9 h-9 rounded-2xl flex-shrink-0 bg-gradient-to-br ${avatarGrads[i % avatarGrads.length]} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
              {(log.student?.fullname ?? '?').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {log.student?.fullname ?? 'ไม่ทราบชื่อ'}
                </p>
                {recent && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ใหม่
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{checkLabel[log.check_type]} · {formatThaiTime(log.timestamp)}</p>
            </div>
            <StatusBadge status={log.status} />
          </div>
        )
      })}
    </div>
  )
}
