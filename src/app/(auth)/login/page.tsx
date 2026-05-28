'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/services/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-700">ศูนย์การศึกษาพิเศษ</h1>
        <p className="text-center text-gray-500">ประจำจังหวัดปทุมธานี</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="อีเมล" required
          className="w-full border rounded-lg px-4 py-3 text-base" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="รหัสผ่าน" required
          className="w-full border rounded-lg px-4 py-3 text-base" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-50">
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
