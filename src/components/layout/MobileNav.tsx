'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, Users, School, BarChart3, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'หน้าหลัก' },
  { href: '/attendance', icon: ClipboardCheck, label: 'ลงเวลา' },
  { href: '/students', icon: Users, label: 'นักเรียน' },
  { href: '/classrooms', icon: School, label: 'ห้องเรียน' },
  { href: '/lunch-check', icon: UtensilsCrossed, label: 'อาหาร' },
  { href: '/reports', icon: BarChart3, label: 'รายงาน' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex z-50 pb-safe">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors duration-200',
              isActive ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive && 'text-blue-600')} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
