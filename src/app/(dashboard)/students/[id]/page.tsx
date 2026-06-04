'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, School, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/attendance/StatusBadge'
import { IdCardDialog } from '@/components/students/IdCardDialog'
import { getStudentById } from '@/services/students'
import { getAttendanceByStudent } from '@/services/attendance'
import { formatThaiDate, formatThaiTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Student, AttendanceLog } from '@/types'

const checkTypeLabel: Record<string, string> = {
  check_in: 'เข้าเรียน',
  check_out: 'ออกจากศูนย์',
  pickup: 'รับกลับบ้าน',
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [cardOpen, setCardOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const [s, l] = await Promise.all([
        getStudentById(id),
        getAttendanceByStudent(id),
      ])
      setStudent(s)
      setLogs(l)
      setLoading(false)
    }
    load()
  }, [id])

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 rounded-xl -ml-2">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> กลับ
      </Button>

      {loading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : student ? (
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold overflow-hidden">
                {student.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.profile_image_url} alt={student.fullname} className="w-full h-full object-cover" />
                ) : (
                  student.fullname.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{student.fullname}</h2>
                <p className="text-gray-400">{student.student_code}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <School className="w-4 h-4" aria-hidden="true" /><span>{student.classroom}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" aria-hidden="true" /><span>{student.parent_phone}</span>
              </div>
            </div>
            <Button
              onClick={() => setCardOpen(true)}
              className="mt-5 h-12 rounded-2xl gap-2 bg-amber-500 hover:bg-amber-600 text-base"
            >
              <QrCode className="w-5 h-5" aria-hidden="true" /> ดูบัตร / QR
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-400">ไม่พบข้อมูลนักเรียน</p>
      )}

      {student && (
        <IdCardDialog
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          students={[student]}
        />
      )}

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-base">ประวัติการมาเรียน</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">ยังไม่มีประวัติการลงเวลา</p>
          ) : (
            <div className="space-y-3 max-h-[28rem] overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatThaiDate(log.timestamp)}</p>
                    <p className="text-xs text-gray-400">{checkTypeLabel[log.check_type]} · {formatThaiTime(log.timestamp)}</p>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
