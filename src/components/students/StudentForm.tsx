'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Student } from '@/types'
import { MOCK_CLASSROOMS } from '@/lib/mock-data'

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

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          student_code: initialData.student_code,
          fullname: initialData.fullname,
          classroom: initialData.classroom,
          parent_name: initialData.parent_name,
          parent_phone: initialData.parent_phone,
          profile_image_url: initialData.profile_image_url,
        })
      } else {
        setForm(emptyForm)
      }
    }
    setErrors({})
  }, [open, initialData])

  function set(key: keyof StudentFormData, value: string | null) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
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
                {MOCK_CLASSROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
