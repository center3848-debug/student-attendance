'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { createBrowserClient } from '@/services/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
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
    if (error) {
      toast.error('ลิงก์อาจหมดอายุ กรุณาขอลิงก์รีเซ็ตใหม่อีกครั้ง')
      return
    }
    toast.success('ตั้งรหัสผ่านใหม่เรียบร้อย')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-blue-100 text-base">ศูนย์การศึกษาพิเศษ ปทุมธานี</p>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pw" className="text-sm font-medium text-gray-700">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="pw"
                    type={show ? 'text' : 'password'}
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    autoComplete="new-password"
                    required
                    className="h-14 rounded-2xl text-base px-4 pr-12"
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
              <div className="space-y-2">
                <Label htmlFor="pw2" className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="pw2"
                  type={show ? 'text' : 'password'}
                  value={pw2}
                  onChange={e => setPw2(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  autoComplete="new-password"
                  required
                  className="h-14 rounded-2xl text-base px-4"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 mt-2"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
