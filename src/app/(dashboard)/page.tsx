'use client'
import Link from 'next/link'
import { useAttendance } from '@/hooks/useAttendance'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { AttendanceChart } from '@/components/dashboard/AttendanceChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { getMockStats } from '@/lib/mock-data'
import { formatThaiDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardCheck, BarChart3, ArrowRight, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { stats, loading } = useAttendance()
  const displayStats = stats ?? getMockStats()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-4 right-20 w-12 h-12 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300" aria-hidden="true" />
            <span className="text-blue-100 text-sm font-medium">ศูนย์การศึกษาพิเศษ ปทุมธานี</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">สวัสดี! วันนี้เด็กๆ เป็นอย่างไรบ้าง?</h2>
          <p className="text-blue-100 text-sm">{formatThaiDate(new Date().toISOString())}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link href="/attendance" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
              ลงเวลาเรียน
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
            <Link href="/reports" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              ดูรายงาน
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-3xl" />)}
        </div>
      ) : (
        <StatsCards stats={displayStats} />
      )}

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">สถิติการมาเรียน</h3>
              <p className="text-xs text-gray-400 mt-0.5">7 วันล่าสุด</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full font-medium border border-emerald-100 dark:border-emerald-800/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
          <AttendanceChart />
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-5">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">กิจกรรมล่าสุด</h3>
            <p className="text-xs text-gray-400 mt-0.5">อัปเดตแบบเรียลไทม์</p>
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
