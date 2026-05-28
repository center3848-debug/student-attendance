'use client'
import { useState } from 'react'
import { useAttendance } from '@/hooks/useAttendance'
import { useStudents } from '@/hooks/useStudents'
import { createAttendanceLog } from '@/services/attendance'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { CameraModal } from '@/components/attendance/CameraModal'
import { formatThaiDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { CheckType } from '@/types'

export default function AttendancePage() {
  const { logs, stats, refresh } = useAttendance()
  const { allStudents } = useStudents()
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedCheckType, setSelectedCheckType] = useState<CheckType>('check_in')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)

  const selectedStudent = allStudents.find(s => s.id === selectedStudentId)

  function handleCheckIn(studentId: string, checkType: CheckType) {
    setSelectedStudentId(studentId)
    setSelectedCheckType(checkType)
    setCameraOpen(true)
  }

  async function handleCapture(blob: Blob) {
    if (!selectedStudentId) return
    setLoadingStudentId(selectedStudentId)
    setCameraOpen(false)

    try {
      let imageUrl: string | null = null
      if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
        const form = new FormData()
        form.append('file', blob, 'attendance.jpg')
        const res = await fetch('/api/upload-drive', { method: 'POST', body: form })
        if (res.ok) {
          const data = await res.json()
          imageUrl = data.url
        }
      }

      await createAttendanceLog({
        student_id: selectedStudentId,
        check_type: selectedCheckType,
        image_url: imageUrl,
        device_name: navigator.userAgent.slice(0, 100),
        status: 'present',
      })

      if (selectedStudent?.parent_phone && process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: selectedStudent.parent_phone,
            studentName: selectedStudent.fullname,
            checkType: selectedCheckType,
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            imageUrl,
          }),
        })
      }

      toast.success(`บันทึกเรียบร้อย! ${selectedStudent?.fullname ?? ''}`)
      refresh()
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoadingStudentId(null)
      setSelectedStudentId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ลงเวลาเรียน</h2>
          <p className="text-gray-500 mt-1">{formatThaiDate(new Date().toISOString())}</p>
        </div>
        {stats && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-5 py-3 text-center">
            <p className="text-3xl font-bold text-blue-700">{stats.present}/{stats.total}</p>
            <p className="text-sm text-blue-500">มาเรียนวันนี้</p>
          </div>
        )}
      </div>

      <AttendanceTable
        students={allStudents}
        logs={logs}
        onCheckIn={handleCheckIn}
        loadingStudentId={loadingStudentId}
      />

      <CameraModal
        open={cameraOpen}
        onClose={() => { setCameraOpen(false); setSelectedStudentId(null) }}
        onCapture={handleCapture}
        studentName={selectedStudent?.fullname ?? ''}
      />
    </div>
  )
}
