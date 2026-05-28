'use client'
import { useState } from 'react'
import { useAttendance } from '@/hooks/useAttendance'
import { useStudents } from '@/hooks/useStudents'
import { createAttendanceLog } from '@/services/attendance'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { CameraModal } from '@/components/attendance/CameraModal'
import { formatThaiDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Users, TrendingUp } from 'lucide-react'
import type { CheckType } from '@/types'

export default function AttendancePage() {
  const { logs, stats, refresh } = useAttendance()
  const { allStudents } = useStudents()
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedCheckType, setSelectedCheckType] = useState<CheckType>('check_in')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)

  const selectedStudent = allStudents.find(s => s.id === selectedStudentId)
  const presentPct = stats && stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

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
        if (res.ok) imageUrl = (await res.json()).url
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
      {/* Hero summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-5 text-white shadow-xl shadow-emerald-500/20">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-12 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-emerald-100 text-sm font-medium mb-1">มาเรียนวันนี้</p>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-bold">{stats?.present ?? 0}</p>
              <p className="text-2xl font-semibold text-emerald-200 mb-1">/ {stats?.total ?? 0} คน</p>
            </div>
            <p className="text-sm text-emerald-100 mt-1">{formatThaiDate(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
              <Users className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats?.late ?? 0}</p>
              <p className="text-xs text-gray-500">มาสาย</p>
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
              <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{presentPct}%</p>
              <p className="text-xs text-gray-500">อัตราการมา</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl p-5">
        <AttendanceTable
          students={allStudents}
          logs={logs}
          onCheckIn={handleCheckIn}
          loadingStudentId={loadingStudentId}
        />
      </div>

      <CameraModal
        open={cameraOpen}
        onClose={() => { setCameraOpen(false); setSelectedStudentId(null) }}
        onCapture={handleCapture}
        studentName={selectedStudent?.fullname ?? ''}
      />
    </div>
  )
}
