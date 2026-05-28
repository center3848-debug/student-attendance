'use client'
import { useAttendance } from '@/hooks/useAttendance'
import { StatusBadge } from '@/components/attendance/StatusBadge'
import { formatThaiTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList } from 'lucide-react'

const checkTypeLabel: Record<string, string> = {
  check_in: 'เข้าเรียน',
  check_out: 'ออกจากศูนย์',
  pickup: 'รับกลับบ้าน',
}

function getInitials(name: string) {
  return name ? name.charAt(0) : '?'
}

const avatarColors = ['bg-blue-200 text-blue-800', 'bg-emerald-200 text-emerald-800', 'bg-purple-200 text-purple-800', 'bg-amber-200 text-amber-800']

export function RecentActivity() {
  const { logs, loading } = useAttendance()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <ClipboardList className="w-12 h-12 mb-3 text-gray-300" aria-hidden="true" />
        <p className="text-base">ยังไม่มีการลงเวลาวันนี้</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {logs.slice(0, 10).map((log, i) => (
        <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
            {getInitials(log.student?.fullname ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
              {log.student?.fullname ?? 'ไม่ทราบชื่อ'}
            </p>
            <p className="text-xs text-gray-400">{checkTypeLabel[log.check_type]} · {formatThaiTime(log.timestamp)}</p>
          </div>
          <StatusBadge status={log.status} />
        </div>
      ))}
    </div>
  )
}
