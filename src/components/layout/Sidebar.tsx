'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, Users, School, BarChart3, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'หน้าหลัก', color: 'from-blue-500 to-indigo-500' },
  { href: '/attendance', icon: ClipboardCheck, label: 'ลงเวลาเรียน', color: 'from-emerald-500 to-teal-500' },
  { href: '/students', icon: Users, label: 'ข้อมูลนักเรียน', color: 'from-violet-500 to-purple-500' },
  { href: '/classrooms', icon: School, label: 'ห้องเรียน', color: 'from-amber-500 to-orange-500' },
  { href: '/lunch-check', icon: UtensilsCrossed, label: 'ตรวจอาหารกลางวัน', color: 'from-cyan-500 to-blue-500' },
  { href: '/reports', icon: BarChart3, label: 'รายงาน', color: 'from-rose-500 to-pink-500' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/50">
      <div className="relative overflow-hidden px-5 py-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-3 right-16 w-8 h-8 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-1 ring-white/30">
            <School className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ศูนย์การศึกษาพิเศษ</p>
            <p className="text-blue-100 text-xs leading-tight">ประจำจังหวัดปทุมธานี</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-3 rounded-2xl text-base font-medium transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50/80 dark:hover:bg-gray-800/60 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                isActive ? 'bg-white/20' : `bg-gradient-to-br ${color}`
              )}>
                <Icon className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-100/60 dark:border-gray-700 p-3">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">ระบบลงเวลา v1.0</p>
          <p className="text-xs text-gray-400 mt-0.5">ศูนย์การศึกษาพิเศษ ปทุมธานี</p>
        </div>
      </div>
    </aside>
  )
}
