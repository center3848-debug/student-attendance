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
  { icon: ScanLine, title: 'เช็คชื่อด้วย QR Code', desc: 'จ่อบัตรนักเรียน ลงเวลาได้ในวินาที', color: 'from-sky-400 to-blue-500' },
  { icon: QrCode, title: 'ออกบัตรนักเรียนอัตโนมัติ', desc: 'สร้างบัตร + QR ให้ทันทีหลังเพิ่มข้อมูล', color: 'from-violet-400 to-purple-500' },
  { icon: Users, title: 'แจ้งผู้ปกครองทันที', desc: 'ส่งแจ้งเตือนเข้า–กลับเข้ากลุ่มอัตโนมัติ', color: 'from-rose-400 to-pink-500' },
  { icon: TrendingUp, title: 'สรุปสถิติการมาเรียน', desc: 'ดูภาพรวมรายวัน/รายเดือนแบบเรียลไทม์', color: 'from-amber-400 to-orange-500' },
]

/* ===== ชิ้นส่วนตกแต่งน่ารัก (วาดด้วย SVG) ===== */
function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="47" y="3" width="6" height="15" rx="3" fill="currentColor" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill="currentColor" />
    </svg>
  )
}
function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 34" className={className} aria-hidden="true">
      <ellipse cx="20" cy="22" rx="15" ry="11" fill="currentColor" />
      <ellipse cx="37" cy="16" rx="17" ry="14" fill="currentColor" />
      <ellipse cx="49" cy="23" rx="13" ry="10" fill="currentColor" />
      <rect x="9" y="22" width="46" height="11" rx="6" fill="currentColor" />
    </svg>
  )
}
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="currentColor" />
    </svg>
  )
}
function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 21s-8-5.2-8-11a5 5 0 019-3 5 5 0 019 3c0 5.8-8 11-8 11z" fill="currentColor" />
    </svg>
  )
}

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
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== พื้นหลังออกแบบเอง (พาสเทลอุ่น + ของน่ารัก) ===== */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* ไล่สีพื้น */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100" />
        {/* ลายจุดนุ่ม ๆ */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(#fda4af 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }}
        />
        {/* ก้อนเบลอนุ่ม */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-rose-200/40 blur-3xl" />

        {/* ดวงอาทิตย์ยิ้ม */}
        <Sun className="absolute top-8 right-10 w-24 h-24 text-amber-300 motion-safe:animate-pulse" />
        {/* เมฆ */}
        <Cloud className="absolute top-16 left-12 w-28 text-white/80" />
        <Cloud className="absolute top-40 right-1/3 w-20 text-white/70" />
        <Cloud className="absolute bottom-40 left-8 w-24 text-white/70" />
        {/* ประกาย + หัวใจ */}
        <Sparkle className="absolute top-1/3 left-1/4 w-6 h-6 text-amber-300" />
        <Sparkle className="absolute top-24 right-1/4 w-4 h-4 text-rose-300" />
        <Sparkle className="absolute bottom-1/3 right-16 w-5 h-5 text-sky-300" />
        <Heart className="absolute bottom-1/4 left-1/4 w-6 h-6 text-rose-300/80" />
        <Heart className="absolute top-1/2 right-12 w-5 h-5 text-pink-300/70" />

        {/* เนินหญ้าน่ารักด้านล่าง */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 140 C 240 90 480 90 720 130 C 960 170 1200 170 1440 120 L1440 220 L0 220 Z" fill="#bbf7d0" fillOpacity="0.7" />
          <path d="M0 170 C 280 130 560 200 840 170 C 1120 140 1300 190 1440 165 L1440 220 L0 220 Z" fill="#86efac" fillOpacity="0.7" />
        </svg>
      </div>

      {/* ===== เนื้อหา ===== */}
      <div className="relative min-h-screen grid lg:grid-cols-2">
        {/* ฝั่งซ้าย: branding */}
        <div className="hidden lg:flex flex-col justify-center px-14 xl:px-20">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-200">
              <GraduationCap className="w-9 h-9 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">ศูนย์การศึกษาพิเศษ</h1>
              <p className="text-gray-500">ประจำจังหวัดปทุมธานี</p>
            </div>
          </div>

          <h2 className="mt-10 text-4xl xl:text-5xl font-extrabold text-gray-800 leading-tight">
            ยินดีต้อนรับ
            <span className="block bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
              ครูคนเก่ง 🌈
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-md">
            ระบบลงเวลานักเรียนที่ดูแลด้วยหัวใจ 💛 เช็คชื่อเข้า–รับกลับบ้านง่าย ๆ ด้วย QR Code อุ่นใจทั้งครูและผู้ปกครอง
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-xl">
            {highlights.map(h => (
              <div key={h.title} className="flex items-start gap-3 bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm border border-white">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${h.color} flex items-center justify-center flex-shrink-0 shadow`}>
                  <h.icon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 leading-tight">{h.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ฝั่งขวา: ฟอร์ม */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* แบรนด์ย่อสำหรับมือถือ */}
            <div className="lg:hidden flex flex-col items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-200">
                <GraduationCap className="w-9 h-9 text-white" aria-hidden="true" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800 leading-tight">ศูนย์การศึกษาพิเศษ</h1>
                <p className="text-sm text-gray-500">ประจำจังหวัดปทุมธานี</p>
              </div>
            </div>

            <div className="relative bg-white/85 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-rose-200/50 border-2 border-white p-8 sm:p-10">
              {/* ป้ายน่ารักมุมการ์ด */}
              <Sparkle className="absolute -top-3 -right-2 w-7 h-7 text-amber-300 motion-safe:animate-pulse" />

              <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
              <p className="text-gray-500 mt-1 mb-6">กรอกอีเมลและรหัสผ่านเพื่อเริ่มใช้งานได้เลย 😊</p>

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
                    className="h-14 rounded-2xl text-base border-gray-200 focus:border-rose-400 focus:ring-rose-300 px-4"
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
                      className="h-14 rounded-2xl text-base border-gray-200 focus:border-rose-400 focus:ring-rose-300 px-4 pr-12"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-5 h-5 rounded-md border-gray-300 cursor-pointer accent-rose-500"
                    />
                    <span className="text-sm text-gray-600">จดจำฉันไว้</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-amber-400 via-rose-400 to-violet-500 hover:from-amber-500 hover:via-rose-500 hover:to-violet-600 shadow-lg shadow-rose-200 gap-2 mt-2 border-0"
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

            <p className="text-center text-sm text-gray-400 mt-6">ระบบลงเวลานักเรียน v1.0 · ทำด้วยใจ 💗</p>
          </div>
        </div>
      </div>
    </div>
  )
}
