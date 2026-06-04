'use client'
import { useRef, useState } from 'react'
import { useAttendance } from '@/hooks/useAttendance'
import { useStudents } from '@/hooks/useStudents'
import { createAttendanceLog } from '@/services/attendance'
import { resolveStatus } from '@/lib/attendance-status'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { QRScannerModal, type ScanResult } from '@/components/attendance/QRScannerModal'
import { formatThaiDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Users, TrendingUp, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckType, Student } from '@/types'

const CHECK_MODES: { type: CheckType; label: string }[] = [
  { type: 'check_in', label: 'เข้าเรียน' },
  { type: 'pickup', label: 'รับกลับบ้าน' },
]
const modeLabel = (t: CheckType) => CHECK_MODES.find(m => m.type === t)?.label ?? ''

export default function AttendancePage() {
  const { logs, stats, refresh } = useAttendance()
  const { allStudents } = useStudents()
  const [mode, setMode] = useState<CheckType>('check_in')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)
  // กันบันทึกซ้ำระหว่างสแกนรัว ก่อน logs จะรีเฟรชทัน
  const recordedRef = useRef<Set<string>>(new Set())

  const presentPct = stats && stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  /** บันทึกการเช็คชื่อหนึ่งครั้ง (ใช้ทั้งสแกน QR และปุ่มในตาราง) */
  async function recordAttendance(student: Student, checkType: CheckType): Promise<ScanResult> {
    const key = `${student.id}:${checkType}`
    const label = modeLabel(checkType)
    const already =
      recordedRef.current.has(key) ||
      logs.some(l => l.student_id === student.id && l.check_type === checkType)
    if (already) {
      return { ok: false, name: student.fullname, message: `บันทึก "${label}" ของวันนี้แล้ว` }
    }
    recordedRef.current.add(key)
    try {
      const status = resolveStatus(checkType)
      await createAttendanceLog({
        student_id: student.id,
        check_type: checkType,
        image_url: null,
        device_name: navigator.userAgent.slice(0, 100),
        status,
      })
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.fullname,
          studentCode: student.student_code,
          classroom: student.classroom,
          checkType,
          status,
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          imageUrl: null,
        }),
      }).catch(() => {})
      refresh()
      return { ok: true, name: student.fullname, message: `${label} สำเร็จ` }
    } catch {
      recordedRef.current.delete(key)
      return { ok: false, name: student.fullname, message: 'เกิดข้อผิดพลาด ลองใหม่' }
    }
  }

  // เรียกจาก QR scanner: หา student จากรหัสในบัตร
  async function handleScan(code: string): Promise<ScanResult> {
    const student = allStudents.find(s => s.student_code === code)
    if (!student) {
      return { ok: false, name: 'ไม่พบบัตร', message: `ไม่พบนักเรียนรหัส ${code}` }
    }
    return recordAttendance(student, mode)
  }

  // เรียกจากปุ่มในตาราง (เช็คตรง ไม่ต้องสแกน)
  async function handleCheckIn(studentId: string, checkType: CheckType) {
    const student = allStudents.find(s => s.id === studentId)
    if (!student) return
    setLoadingStudentId(studentId)
    const res = await recordAttendance(student, checkType)
    setLoadingStudentId(null)
    if (res.ok) toast.success(`บันทึกเรียบร้อย! ${res.name}`)
    else toast.info(res.message)
  }

  function openScanner() {
    recordedRef.current.clear()
    setScannerOpen(true)
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

      {/* แถบสแกน QR */}
      <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">เลือกประเภทการเช็ค แล้วกดสแกน</p>
          <div className="flex gap-2 flex-wrap">
            {CHECK_MODES.map(m => (
              <button
                key={m.type}
                onClick={() => setMode(m.type)}
                className={cn(
                  'px-5 py-2.5 rounded-2xl text-base font-medium transition-all duration-200 cursor-pointer',
                  mode === m.type
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openScanner}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
        >
          <ScanLine className="w-6 h-6" aria-hidden="true" />
          สแกน QR · {modeLabel(mode)}
        </button>
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

      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        modeLabel={modeLabel(mode)}
        onScan={handleScan}
      />
    </div>
  )
}
