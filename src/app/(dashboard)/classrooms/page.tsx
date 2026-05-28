'use client'
import { useRouter } from 'next/navigation'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useAttendance'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { MOCK_CLASSROOMS } from '@/lib/mock-data'

const roomConfig = [
  { room: 'ห้อง 1', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  { room: 'ห้อง 2', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { room: 'ห้อง 3', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-200' },
]

export default function ClassroomsPage() {
  const router = useRouter()
  const { allStudents } = useStudents()
  const { logs } = useAttendance()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ห้องเรียน</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_CLASSROOMS.map((room, i) => {
          const config = roomConfig[i]
          const roomStudents = allStudents.filter(s => s.classroom === room)
          const present = logs.filter(l => roomStudents.some(s => s.id === l.student_id) && l.status === 'present').length
          const pct = roomStudents.length > 0 ? Math.round((present / roomStudents.length) * 100) : 0

          return (
            <Card
              key={room}
              onClick={() => router.push(`/students?classroom=${encodeURIComponent(room)}`)}
              className={`border-0 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${config.bg} ring-1 ${config.ring}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}>
                  <Users className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{room}</h3>
                  <p className="text-gray-500">{roomStudents.length} คน</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">มาเรียนวันนี้</span>
                    <span className="text-sm font-semibold text-gray-800">{present}/{roomStudents.length} คน</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
