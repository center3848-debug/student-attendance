import { GraduationCap } from 'lucide-react'
import type { Student } from '@/types'

export const CENTER_NAME = 'ศูนย์การศึกษาพิเศษ ประจำจังหวัดปทุมธานี'

interface StudentIdCardProps {
  student: Student
  qrDataUrl: string | null
}

/**
 * บัตรประจำตัวนักเรียนพร้อมรูปใบหน้า + QR สำหรับสแกนเช็คชื่อ.
 * โทนอบอุ่น ตัวอักษรใหญ่ อ่านง่าย เหมาะกับการพิมพ์ลงกระดาษ/ลามิเนต.
 */
export function StudentIdCard({ student, qrDataUrl }: StudentIdCardProps) {
  return (
    <div className="w-[360px] rounded-3xl overflow-hidden bg-white border border-amber-200 shadow-md text-gray-800 break-inside-avoid">
      {/* หัวบัตร */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-white/25 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">บัตรประจำตัวนักเรียน</p>
            <p className="text-[11px] text-amber-50">{CENTER_NAME}</p>
          </div>
        </div>
      </div>

      {/* ตัวบัตร */}
      <div className="px-5 py-4 flex items-center gap-3">
        {/* รูปใบหน้า */}
        <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-100 flex items-center justify-center flex-shrink-0">
          {student.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.profile_image_url} alt={student.fullname} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-amber-700">{student.fullname.charAt(0) || '?'}</span>
          )}
        </div>

        {/* ข้อมูล */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-800 leading-snug break-words">{student.fullname}</p>
          <p className="mt-0.5 text-xs text-gray-500">รหัส: {student.student_code}</p>
          <span className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {student.classroom}
          </span>
        </div>

        {/* QR */}
        <div className="flex-shrink-0 text-center">
          <div className="w-[96px] h-[96px] rounded-2xl bg-white border-2 border-amber-200 p-1 flex items-center justify-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt={`QR ${student.student_code}`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-xl bg-amber-50 animate-pulse" />
            )}
          </div>
          <p className="mt-1 text-[10px] text-gray-400">สแกนเพื่อเช็คชื่อ</p>
        </div>
      </div>
    </div>
  )
}
