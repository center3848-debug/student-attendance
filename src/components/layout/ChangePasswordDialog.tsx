'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@/services/supabase'
import { toast } from 'sonner'

export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 6) { toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (pw !== pw2) { toast.error('รหัสผ่านทั้งสองช่องไม่ตรงกัน'); return }
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: pw })
    setLoading(false)
    if (error) { toast.error(`เปลี่ยนรหัสไม่สำเร็จ: ${error.message}`); return }
    toast.success('เปลี่ยนรหัสผ่านเรียบร้อย')
    setPw(''); setPw2('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setPw(''); setPw2(''); onClose() } }}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">เปลี่ยนรหัสผ่าน</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-sm font-medium">รหัสผ่านใหม่</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoComplete="new-password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="h-12 rounded-xl text-base pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pw2" className="text-sm font-medium">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="new-pw2"
              type={show ? 'text' : 'password'}
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              autoComplete="new-password"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              className="h-12 rounded-xl text-base"
              required
            />
          </div>
          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12 flex-1">ยกเลิก</Button>
            <Button type="submit" disabled={loading} className="rounded-xl h-12 flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
