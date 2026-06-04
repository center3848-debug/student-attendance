'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, GraduationCap, ScanLine, QrCode, Users, TrendingUp } from 'lucide-react'
import { createBrowserClient } from '@/services/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const REMEMBER_KEY = 'remembered_email'

const highlights = [
  { icon: ScanLine, title: 'เช็คชื่อด้วย QR Code', desc: 'จ่อบัตรนักเรียน ลงเวลาได้ภายในวินาที' },
  { icon: QrCode, title: 'ออกบัตรนักเรียนอัตโนมัติ', desc: 'สร้างบัตร + QR ให้ทันทีหลังเพิ่มข้อมูล' },
  { icon: Users, title: 'แจ้งผู้ปกครองทันที', desc: 'ส่งแจ้งเตือนเข้า-กลับเข้ากลุ่มอัตโนมัติ' },
  { icon: TrendingUp, title: 'สรุปสถิติการมาเรียน', desc: 'ดูภาพรวมรายวัน/รายเดือนแบบเรียลไทม์' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  // prefill อีเมลที่จดจำไว้ (เลื่อน setState ออกจาก effect body เป็น callback)
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (!saved) return
    const id = requestAnimationFrame(() => { setEmail(saved); setRemember(true) })
    return () => cancelAnimationFrame(id)
  }, [])

  async function handleForgotPassword() {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) { toast.info('กรุณากรอกอีเมลของคุณก่อน แล้วกด "ลืมรหัสผ่าน?" อีกครั้ง'); return }
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) toast.error(`ส่งคำขอไม่สำเร็จ: ${error.message}`)
    else toast.info('หากอีเมลนี้มีในระบบ ลิงก์รีเซ็ตจะถูกส่งไป — กรุณาตรวจกล่องจดหมาย (ต้องตั้งค่าอีเมลใน Supabase ก่อนจึงจะส่งได้จริง)')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    // จดจำอีเมลไว้ prefill ครั้งหน้า
    if (remember) localStorage.setItem(REMEMBER_KEY, cleanEmail)
    else localStorage.removeItem(REMEMBER_KEY)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    })
    if (error) {
      const detail =
        error.message === 'Invalid login credentials'
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่'
          : `เข้าสู่ระบบไม่สำเร็จ: ${error.message}`
      toast.error(detail)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ===== ซ้าย: Branding / จุดเด่น ===== */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white p-12 flex-col justify-between">
        {/* วงกลมตกแต่ง */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full bg-cyan-300/10 blur-2xl" aria-hidden="true" />

        {/* โลโก้ + ชื่อ */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">ศูนย์การศึกษาพิเศษ</h1>
              <p className="text-blue-100">ประจำจังหวัดปทุมธานี</p>
            </div>
          </div>
          <p className="mt-8 text-3xl font-bold leading-snug max-w-md">
            ระบบลงเวลานักเรียน<br />ที่ดูแลด้วยหัวใจ 💙
          </p>
          <p className="mt-3 text-blue-100 text-lg max-w-md">
            เช็คชื่อเข้า–รับกลับบ้านด้วย QR Code ง่าย รวดเร็ว และอุ่นใจทั้งครูและผู้ปกครอง
          </p>
        </div>

        {/* จุดเด่น */}
        <div className="relative space-y-4 my-8">
          {highlights.map(h => (
            <div key={h.title} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
                <h.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-lg">{h.title}</p>
                <p className="text-blue-100 text-sm">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-blue-200 text-sm">© {new Date().getFullYear()} ศูนย์การศึกษาพิเศษ ประจำจังหวัดปทุมธานี · ระบบลงเวลานักเรียน v1.0</p>
      </div>

      {/* ===== ขวา: ฟอร์มเข้าสู่ระบบ ===== */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="w-full max-w-md">
          {/* แบรนด์ย่อสำหรับมือถือ */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">ศูนย์การศึกษาพิเศษ</h1>
              <p className="text-sm text-gray-500">ประจำจังหวัดปทุมธานี</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-200/50 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">เข้าสู่ระบบ</h2>
            <p className="text-gray-500 mb-6">ยินดีต้อนรับกลับมา 👋 กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="กรอกอีเมลของคุณ"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className="h-14 rounded-2xl text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    required
                    className="h-14 rounded-2xl text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400 px-4 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me + ลืมรหัสผ่าน */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">จดจำฉันไว้</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-200 gap-2 mt-2"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                )}
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">ระบบลงเวลานักเรียน v1.0</p>
        </div>
      </div>
    </div>
  )
}
