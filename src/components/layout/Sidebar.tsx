'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, Users, School, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'หน้าหลัก' },
  { href: '/attendance', icon: ClipboardCheck, label: 'ลงเวลาเรียน' },
  { href: '/students', icon: Users, label: 'ข้อมูลนักเรียน' },
  { href: '/classrooms', icon: School, label: 'ห้องเรียน' },
  { href: '/reports', icon: BarChart3, label: 'รายงาน' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0">
      {/* School header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ศูนย์การศึกษาพิเศษ</p>
            <p className="text-blue-100 text-xs leading-tight">ประจำจังหวัดปทุมธานี</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400">ระบบลงเวลา v1.0</p>
      </div>
    </aside>
  )
}
