'use client'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from './StatusBadge'
import { CheckInButton } from './CheckInButton'
import { formatThaiTime } from '@/lib/utils'
import { useClassrooms } from '@/hooks/useClassrooms'
import type { Student, AttendanceLog, CheckType } from '@/types'
import { cn } from '@/lib/utils'

interface AttendanceTableProps {
  students: Student[]
  logs: AttendanceLog[]
  onCheckIn: (studentId: string, checkType: CheckType) => void
  loadingStudentId: string | null
}

export function AttendanceTable({ students, logs, onCheckIn, loadingStudentId }: AttendanceTableProps) {
  const [search, setSearch] = useState('')
  const [activeRoom, setActiveRoom] = useState<string>('ทั้งหมด')
  const { names: roomNames } = useClassrooms()

  const classrooms = ['ทั้งหมด', ...roomNames]

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchRoom = activeRoom === 'ทั้งหมด' || s.classroom === activeRoom
      const matchSearch = !search || s.fullname.includes(search) || s.student_code.includes(search)
      return matchRoom && matchSearch
    })
  }, [students, activeRoom, search])

  function getLog(studentId: string) {
    return logs.find(l => l.student_id === studentId)
  }

  function getInitials(name: string) {
    return name ? name.charAt(0) : '?'
  }

  const avatarColors = [
    'bg-blue-200 text-blue-800',
    'bg-emerald-200 text-emerald-800',
    'bg-purple-200 text-purple-800',
    'bg-amber-200 text-amber-800',
    'bg-rose-200 text-rose-800',
    'bg-cyan-200 text-cyan-800',
  ]
  function roomColor(classroom: string) {
    const idx = roomNames.indexOf(classroom)
    return avatarColors[idx >= 0 ? idx % avatarColors.length : 0]
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <Input
            placeholder="ค้นหานักเรียน..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11 text-base"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {classrooms.map(room => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                activeRoom === room
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
              )}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-base" role="table">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500 w-12">#</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">นักเรียน</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500 hidden sm:table-cell">ห้อง</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">สถานะ</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500 hidden md:table-cell">เวลา</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">ลงเวลา</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const log = getLog(student.id)
                const colorClass = roomColor(student.classroom)
                const isLoading = loadingStudentId === student.id
                const nextCheckType: CheckType = log ? 'pickup' : 'check_in'

                return (
                  <tr key={student.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-sm">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {isLoading ? (
                          <Skeleton className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}>
                            {getInitials(student.fullname)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{student.fullname}</p>
                          <p className="text-xs text-gray-400">{student.student_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{student.classroom}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log ? <StatusBadge status={log.status} /> : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">ยังไม่มา</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                      {log ? formatThaiTime(log.timestamp) : '—'}
                    </td>
                    <td className="px-4 py-3 w-40">
                      <CheckInButton
                        checkType={nextCheckType}
                        onPress={() => onCheckIn(student.id, nextCheckType)}
                        loading={isLoading}
                        disabled={isLoading}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-base">ไม่พบนักเรียนที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
