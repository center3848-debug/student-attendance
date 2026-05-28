'use client'
import { useEffect, useState } from 'react'
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { DashboardStats } from '@/types'

interface StatsCardsProps { stats: DashboardStats }

const cards = [
  { key: 'total' as const, label: 'นักเรียนทั้งหมด', sub: 'ลงทะเบียนในระบบ', icon: Users, grad: 'from-blue-500 via-blue-600 to-indigo-600', shadow: 'shadow-blue-500/30' },
  { key: 'present' as const, label: 'มาเรียนวันนี้', sub: 'อยู่ในโรงเรียน', icon: CheckCircle2, grad: 'from-emerald-500 via-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/30' },
  { key: 'absent' as const, label: 'ขาดเรียน', sub: 'ไม่มาโรงเรียน', icon: XCircle, grad: 'from-rose-500 via-rose-600 to-pink-600', shadow: 'shadow-rose-500/30' },
  { key: 'late' as const, label: 'มาสาย', sub: 'หลังเวลาเรียน', icon: Clock, grad: 'from-amber-500 via-amber-600 to-orange-600', shadow: 'shadow-amber-500/30' },
]

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let current = 0
    const steps = 20
    const increment = Math.ceil(target / steps)
    const interval = setInterval(() => {
      current += increment
      if (current >= target) { setVal(target); clearInterval(interval) }
      else setVal(current)
    }, 30)
    return () => clearInterval(interval)
  }, [target])
  return <>{val}</>
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ key, label, sub, icon: Icon, grad, shadow }) => {
        const value = stats[key]
        const pct = stats.total > 0 && key !== 'total' ? Math.round((value / stats.total) * 100) : null
        return (
          <div key={key} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${grad} p-5 text-white shadow-xl ${shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default`}>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/5" />
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <p className="text-4xl font-bold tracking-tight"><AnimatedNumber target={value} /></p>
              <p className="text-sm font-medium opacity-90 mt-1">{label}</p>
              <p className="text-xs opacity-60 mt-0.5">{sub}</p>
              {pct !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20">
                    <div className="h-1.5 rounded-full bg-white/70 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold opacity-80">{pct}%</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
