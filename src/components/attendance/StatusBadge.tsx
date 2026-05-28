import type { AttendanceStatus } from '@/types'

const config: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'มาเรียน', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  absent:  { label: 'ขาดเรียน', className: 'bg-rose-100 text-rose-700 border border-rose-200' },
  late:    { label: 'มาสาย', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  )
}
