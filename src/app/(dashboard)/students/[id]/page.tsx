'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, School } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/attendance/StatusBadge'
import { getStudentById } from '@/services/students'
import { getAttendanceByDate } from '@/services/attendance'
import { formatThaiDate, formatThaiTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Student, AttendanceLog } from '@/types'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const s = await getStudentById(id)
      setStudent(s)
      const today = new Date().toISOString().split('T')[0]
      const l = await getAttendanceByDate(today)
      setLogs(l.filter(log => log.student_id === id))
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
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                {student.fullname.charAt(0)}
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
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-400">ไม่พบข้อมูลนักเรียน</p>
      )}

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-base">ประวัติการมาเรียนวันนี้</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">ยังไม่มีการลงเวลาวันนี้</p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatThaiDate(log.timestamp)}</p>
                    <p className="text-xs text-gray-400">{formatThaiTime(log.timestamp)}</p>
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
