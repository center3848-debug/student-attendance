import { Phone, Pencil, Trash2, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/attendance/StatusBadge'
import { Button } from '@/components/ui/button'
import type { Student, AttendanceStatus } from '@/types'

interface StudentCardProps {
  student: Student
  onEdit: () => void
  onDelete: () => void
  onShowCard: () => void
  attendanceToday: AttendanceStatus | null
}

const roomColors: Record<string, string> = {
  'ห้อง 1': 'bg-blue-100 text-blue-800',
  'ห้อง 2': 'bg-emerald-100 text-emerald-800',
  'ห้อง 3': 'bg-purple-100 text-purple-800',
}
const avatarColors: Record<string, string> = {
  'ห้อง 1': 'bg-blue-200 text-blue-700',
  'ห้อง 2': 'bg-emerald-200 text-emerald-700',
  'ห้อง 3': 'bg-purple-200 text-purple-700',
}

export function StudentCard({ student, onEdit, onDelete, onShowCard, attendanceToday }: StudentCardProps) {
  const initials = student.fullname.charAt(0)
  const avatarClass = avatarColors[student.classroom] ?? 'bg-gray-200 text-gray-700'
  const roomClass = roomColors[student.classroom] ?? 'bg-gray-100 text-gray-600'

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${avatarClass}`}>
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-base">{student.fullname}</p>
              <p className="text-xs text-gray-400">{student.student_code}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onShowCard} className="w-8 h-8 rounded-lg" aria-label="ดูบัตร/QR">
              <QrCode className="w-4 h-4 text-gray-400 hover:text-amber-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} className="w-8 h-8 rounded-lg" aria-label="แก้ไข">
              <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="w-8 h-8 rounded-lg" aria-label="ลบ">
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-rose-500" />
            </Button>
          </div>
        </div>

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${roomClass}`}>
          {student.classroom}
        </span>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Phone className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          <span className="truncate">{student.parent_name}</span>
        </div>

        <div className="mt-3">
          {attendanceToday ? (
            <StatusBadge status={attendanceToday} />
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200">
              ยังไม่ลงเวลา
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
