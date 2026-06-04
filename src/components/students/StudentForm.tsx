'use client'
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Student } from '@/types'
import { useClassrooms } from '@/hooks/useClassrooms'

type StudentFormData = Omit<Student, 'id' | 'created_at'>

interface StudentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: StudentFormData) => void
  initialData: Student | null
  loading: boolean
}

const emptyForm: StudentFormData = {
  student_code: '',
  fullname: '',
  classroom: '',
  parent_name: '',
  parent_phone: '',
  profile_image_url: null,
}

export function StudentForm({ open, onClose, onSubmit, initialData, loading }: StudentFormProps) {
  const [form, setForm] = useState<StudentFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { names: classroomNames } = useClassrooms()

  useEffect(() => {
    // เลื่อน setState ออกจาก effect body (เลี่ยง cascading render / ผ่านกฎ react-hooks)
    const id = requestAnimationFrame(() => {
      if (open) {
        setForm(initialData ? {
          student_code: initialData.student_code,
          fullname: initialData.fullname,
          classroom: initialData.classroom,
          parent_name: initialData.parent_name,
          parent_phone: initialData.parent_phone,
          profile_image_url: initialData.profile_image_url,
        } : emptyForm)
      }
      setErrors({})
    })
    return () => cancelAnimationFrame(id)
  }, [open, initialData])

  function set(key: keyof StudentFormData, value: string | null) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // ให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('กรุณาเลือกไฟล์รูปภาพ'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-drive', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      set('profile_image_url', url)
    } catch {
      toast.error('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setUploading(false)
    }
  }

  function validate() {
    const e: Partial<Record<keyof StudentFormData, string>> = {}
    if (!form.student_code) e.student_code = 'กรุณากรอกรหัสนักเรียน'
    if (!form.fullname) e.fullname = 'กรุณากรอกชื่อ-นามสกุล'
    if (!form.classroom) e.classroom = 'กรุณาเลือกห้องเรียน'
    if (!form.parent_name) e.parent_name = 'กรุณากรอกชื่อผู้ปกครอง'
    if (!form.parent_phone) e.parent_phone = 'กรุณากรอกเบอร์โทร'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const textFields: Array<[keyof StudentFormData, string, string]> = [
    ['student_code', 'รหัสนักเรียน', 'text'],
    ['fullname', 'ชื่อ-นามสกุล', 'text'],
    ['parent_name', 'ชื่อผู้ปกครอง', 'text'],
    ['parent_phone', 'เบอร์โทรผู้ปกครอง', 'tel'],
  ]

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {initialData ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* รูปใบหน้านักเรียน */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50 flex items-center justify-center">
              {form.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.profile_image_url} alt="รูปนักเรียน" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-amber-400" aria-hidden="true" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl h-9 gap-2 text-sm">
                <Camera className="w-4 h-4" /> {form.profile_image_url ? 'เปลี่ยนรูป' : 'เพิ่มรูปใบหน้า'}
              </Button>
              {form.profile_image_url && (
                <Button type="button" variant="ghost" onClick={() => set('profile_image_url', null)} disabled={uploading} className="rounded-xl h-9 gap-1 text-sm text-rose-500">
                  <X className="w-4 h-4" /> ลบรูป
                </Button>
              )}
            </div>
          </div>

          {textFields.map(([key, label, type]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
              <Input
                id={key}
                type={type}
                value={(form[key] as string) ?? ''}
                onChange={e => set(key, e.target.value)}
                className={`h-12 rounded-xl text-base ${errors[key] ? 'border-rose-400' : ''}`}
              />
              {errors[key] && <p className="text-xs text-rose-500">{errors[key]}</p>}
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-sm font-medium">ห้องเรียน</Label>
            <Select value={form.classroom} onValueChange={(v: string | null) => set('classroom', v)}>
              <SelectTrigger className={`h-12 rounded-xl text-base ${errors.classroom ? 'border-rose-400' : ''}`}>
                <SelectValue placeholder="เลือกห้องเรียน" />
              </SelectTrigger>
              <SelectContent>
                {(form.classroom && !classroomNames.includes(form.classroom)
                  ? [form.classroom, ...classroomNames]
                  : classroomNames
                ).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.classroom && <p className="text-xs text-rose-500">{errors.classroom}</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12">ยกเลิก</Button>
            <Button type="submit" disabled={loading} className="rounded-xl h-12 min-w-[120px] gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
