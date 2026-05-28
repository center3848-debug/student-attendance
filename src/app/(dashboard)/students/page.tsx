'use client'
import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { StudentCard } from '@/components/students/StudentCard'
import { StudentForm } from '@/components/students/StudentForm'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useAttendance'
import { createStudent, updateStudent, deleteStudent } from '@/services/students'
import { toast } from 'sonner'
import { MOCK_CLASSROOMS } from '@/lib/mock-data'
import type { Student, AttendanceStatus } from '@/types'

export default function StudentsPage() {
  const { students, allStudents, loading, search, setSearch } = useStudents()
  const { logs } = useAttendance()
  const [roomFilter, setRoomFilter] = useState<string>('ทั้งหมด')
  function handleRoomChange(value: string | null) { setRoomFilter(value ?? 'ทั้งหมด') }
  const [formOpen, setFormOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = roomFilter === 'ทั้งหมด'
    ? students
    : students.filter(s => s.classroom === roomFilter)

  function getAttendance(id: string): AttendanceStatus | null {
    return logs.find(l => l.student_id === id)?.status ?? null
  }

  async function handleSubmit(data: Omit<Student, 'id' | 'created_at'>) {
    setSaving(true)
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, data)
        toast.success('แก้ไขข้อมูลเรียบร้อย')
      } else {
        await createStudent(data)
        toast.success('เพิ่มนักเรียนเรียบร้อย')
      }
      setFormOpen(false)
      setEditStudent(null)
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteStudent(deleteId)
      toast.success('ลบข้อมูลนักเรียนเรียบร้อย')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ข้อมูลนักเรียน</h2>
          <p className="text-gray-500 mt-1">ทั้งหมด {allStudents.length} คน</p>
        </div>
        <Button
          onClick={() => { setEditStudent(null); setFormOpen(true) }}
          className="h-12 rounded-2xl gap-2 bg-blue-600 hover:bg-blue-700 text-base"
        >
          <UserPlus className="w-5 h-5" aria-hidden="true" />
          เพิ่มนักเรียน
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="ค้นหาชื่อหรือรหัส..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-11 rounded-xl text-base flex-1"
        />
        <Select value={roomFilter} onValueChange={handleRoomChange}>
          <SelectTrigger className="h-11 rounded-xl w-full sm:w-40">
            <SelectValue placeholder="ห้องเรียน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">ทุกห้อง</SelectItem>
            {MOCK_CLASSROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(s => (
            <StudentCard
              key={s.id}
              student={s}
              onEdit={() => { setEditStudent(s); setFormOpen(true) }}
              onDelete={() => setDeleteId(s.id)}
              attendanceToday={getAttendance(s.id)}
            />
          ))}
        </div>
      )}

      <StudentForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditStudent(null) }}
        onSubmit={handleSubmit}
        initialData={editStudent}
        loading={saving}
      />

      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบข้อมูลนักเรียนนี้ใช่ไหม? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700">ลบข้อมูล</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
