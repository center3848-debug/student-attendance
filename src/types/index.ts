export type CheckType = 'check_in' | 'check_out' | 'pickup'
export type AttendanceStatus = 'present' | 'absent' | 'late'
export type UserRole = 'teacher' | 'admin'

export interface Student {
  id: string
  student_code: string
  fullname: string
  classroom: string
  parent_name: string
  parent_phone: string
  profile_image_url: string | null
  created_at: string
}

export interface AttendanceLog {
  id: string
  student_id: string
  check_type: CheckType
  image_url: string | null
  timestamp: string
  device_name: string
  status: AttendanceStatus
  student?: Student
}

export interface AppUser {
  id: string
  fullname: string
  email: string
  role: UserRole
  school_id: string | null
  created_at: string
}

export interface DashboardStats {
  total: number
  present: number
  absent: number
  late: number
  date: string
}
