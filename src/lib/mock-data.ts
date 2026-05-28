import type { Student, AttendanceLog, DashboardStats } from '@/types'

export const MOCK_STUDENTS: Student[] = [
  { id: 'st-01', student_code: 'ST001', fullname: 'สมชาย ใจดี', classroom: 'ห้อง 1', parent_name: 'นางสาว ใจดี', parent_phone: '0812345678', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-02', student_code: 'ST002', fullname: 'นภา รักเรียน', classroom: 'ห้อง 1', parent_name: 'นาย รักเรียน', parent_phone: '0823456789', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-03', student_code: 'ST003', fullname: 'วิชัย มั่นคง', classroom: 'ห้อง 1', parent_name: 'นาง มั่นคง', parent_phone: '0834567890', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-04', student_code: 'ST004', fullname: 'พิมพ์ใจ สดใส', classroom: 'ห้อง 1', parent_name: 'นาย สดใส', parent_phone: '0845678901', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-05', student_code: 'ST005', fullname: 'ธนพล เก่งกาจ', classroom: 'ห้อง 1', parent_name: 'นาง เก่งกาจ', parent_phone: '0856789012', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-06', student_code: 'ST006', fullname: 'กัญญา สุขสม', classroom: 'ห้อง 1', parent_name: 'นาย สุขสม', parent_phone: '0867890123', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-07', student_code: 'ST007', fullname: 'อนันต์ ดีงาม', classroom: 'ห้อง 1', parent_name: 'นาง ดีงาม', parent_phone: '0878901234', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-08', student_code: 'ST008', fullname: 'มาลี วงษ์ทอง', classroom: 'ห้อง 2', parent_name: 'นาย วงษ์ทอง', parent_phone: '0889012345', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-09', student_code: 'ST009', fullname: 'ปิยะ แก้วใส', classroom: 'ห้อง 2', parent_name: 'นาง แก้วใส', parent_phone: '0890123456', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-10', student_code: 'ST010', fullname: 'สุดา ทองดี', classroom: 'ห้อง 2', parent_name: 'นาย ทองดี', parent_phone: '0801234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-11', student_code: 'ST011', fullname: 'ชัยวัฒน์ ศรีสุข', classroom: 'ห้อง 2', parent_name: 'นาง ศรีสุข', parent_phone: '0811234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-12', student_code: 'ST012', fullname: 'นันทิดา พรมมา', classroom: 'ห้อง 2', parent_name: 'นาย พรมมา', parent_phone: '0821234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-13', student_code: 'ST013', fullname: 'รัตนา จันทร์เพ็ง', classroom: 'ห้อง 2', parent_name: 'นาง จันทร์เพ็ง', parent_phone: '0831234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-14', student_code: 'ST014', fullname: 'สิทธิชัย บุญมาก', classroom: 'ห้อง 2', parent_name: 'นาย บุญมาก', parent_phone: '0841234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-15', student_code: 'ST015', fullname: 'วนิดา คงคา', classroom: 'ห้อง 3', parent_name: 'นาง คงคา', parent_phone: '0851234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-16', student_code: 'ST016', fullname: 'ประสิทธิ์ ยิ้มแย้ม', classroom: 'ห้อง 3', parent_name: 'นาย ยิ้มแย้ม', parent_phone: '0861234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-17', student_code: 'ST017', fullname: 'กมลา สว่างใจ', classroom: 'ห้อง 3', parent_name: 'นาง สว่างใจ', parent_phone: '0871234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-18', student_code: 'ST018', fullname: 'ธีระ ขยันทำ', classroom: 'ห้อง 3', parent_name: 'นาย ขยันทำ', parent_phone: '0881234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-19', student_code: 'ST019', fullname: 'พรทิพย์ นาคา', classroom: 'ห้อง 3', parent_name: 'นาง นาคา', parent_phone: '0891234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-20', student_code: 'ST020', fullname: 'สมหมาย ใจกว้าง', classroom: 'ห้อง 3', parent_name: 'นาย ใจกว้าง', parent_phone: '0802345678', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
]

export const MOCK_CLASSROOMS = ['ห้อง 1', 'ห้อง 2', 'ห้อง 3']

const statuses: Array<'present' | 'absent' | 'late'> = [
  'present','present','present','present','present','present','present',
  'late','late','absent','absent','present','present','present',
  'present','present','late','absent','present','present'
]

export const MOCK_ATTENDANCE_LOGS: AttendanceLog[] = MOCK_STUDENTS.map((s, i) => ({
  id: `log-${i + 1}`,
  student_id: s.id,
  check_type: 'check_in' as const,
  image_url: null,
  timestamp: new Date().toISOString(),
  device_name: 'Mock Device',
  status: statuses[i],
  student: s,
}))

export function getMockStats(): DashboardStats {
  return {
    total: MOCK_STUDENTS.length,
    present: statuses.filter(s => s === 'present').length,
    absent: statuses.filter(s => s === 'absent').length,
    late: statuses.filter(s => s === 'late').length,
    date: new Date().toISOString().split('T')[0],
  }
}
