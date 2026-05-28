'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStudents } from '@/hooks/useStudents'
import { useAttendance } from '@/hooks/useAttendance'
import { getClassrooms, createClassroom, deleteClassroom, type Classroom } from '@/services/classrooms'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const colorCycle = [
  { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  { color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-200' },
  { color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  { color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200' },
  { color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-200' },
]

export default function ClassroomsPage() {
  const router = useRouter()
  const { allStudents } = useStudents()
  const { logs } = useAttendance()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function loadClassrooms() {
    setLoadingRooms(true)
    const data = await getClassrooms()
    setClassrooms(data)
    setLoadingRooms(false)
  }

  useEffect(() => { loadClassrooms() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createClassroom(newName, newDesc)
      toast.success(`เพิ่มห้อง "${newName}" เรียบร้อย`)
      setNewName('')
      setNewDesc('')
      setAddOpen(false)
      loadClassrooms()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('unique') || msg.includes('duplicate')) {
        toast.error('ชื่อห้องนี้มีอยู่แล้ว')
      } else {
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteClassroom(deleteId)
      toast.success('ลบห้องเรียนเรียบร้อย')
      loadClassrooms()
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ห้องเรียน</h2>
          <p className="text-gray-500 mt-1">ทั้งหมด {classrooms.length} ห้อง</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="h-12 rounded-2xl gap-2 bg-blue-600 hover:bg-blue-700 text-base"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          เพิ่มห้องเรียน
        </Button>
      </div>

      {loadingRooms ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classrooms.map((room, i) => {
            const cfg = colorCycle[i % colorCycle.length]
            const roomStudents = allStudents.filter(s => s.classroom === room.name)
            const present = logs.filter(l =>
              roomStudents.some(s => s.id === l.student_id) && l.status === 'present'
            ).length
            const pct = roomStudents.length > 0 ? Math.round((present / roomStudents.length) * 100) : 0

            return (
              <Card
                key={room.id}
                className={`border-0 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${cfg.bg} ring-1 ${cfg.ring} group`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-sm cursor-pointer`}
                      onClick={() => router.push(`/students?classroom=${encodeURIComponent(room.name)}`)}
                    >
                      <Users className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(room.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg text-gray-400 hover:text-rose-500"
                      aria-label="ลบห้องเรียน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/students?classroom=${encodeURIComponent(room.name)}`)}
                  >
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-gray-400 mt-0.5">{room.description}</p>
                    )}
                    <p className="text-gray-500 mt-1">{roomStudents.length} คน</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">มาเรียนวันนี้</span>
                      <span className="text-sm font-semibold text-gray-800">{present}/{roomStudents.length} คน</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-500`}
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

          {/* Empty state */}
          {classrooms.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
              <Users className="w-12 h-12 mb-3 text-gray-300" aria-hidden="true" />
              <p className="text-base">ยังไม่มีห้องเรียน</p>
              <Button onClick={() => setAddOpen(true)} variant="outline" className="mt-4 rounded-xl gap-2">
                <Plus className="w-4 h-4" /> เพิ่มห้องเรียนแรก
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { if (!v) { setAddOpen(false); setNewName(''); setNewDesc('') } }}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">เพิ่มห้องเรียนใหม่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="room-name" className="text-sm font-medium">ชื่อห้องเรียน <span className="text-rose-500">*</span></Label>
              <Input
                id="room-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="เช่น ห้อง 4, ห้องบัวขาว, ห้องดอกไม้"
                required
                className="h-12 rounded-xl text-base"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-desc" className="text-sm font-medium text-gray-600">คำอธิบาย (ไม่บังคับ)</Label>
              <Input
                id="room-desc"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="เช่น นักเรียนที่มีความบกพร่องทางการได้ยิน"
                className="h-12 rounded-xl text-base"
              />
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setNewName(''); setNewDesc('') }} className="rounded-xl h-12 flex-1">
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving || !newName.trim()} className="rounded-xl h-12 flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                เพิ่มห้องเรียน
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ลบห้องเรียน?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบห้องเรียนจะไม่กระทบข้อมูลนักเรียนที่อยู่ในห้องนี้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
