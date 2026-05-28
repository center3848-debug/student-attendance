'use client'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/services/supabase'
import { formatThaiDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const pageTitles: Record<string, string> = {
  '/': 'หน้าหลัก',
  '/attendance': 'ลงเวลาเรียน',
  '/students': 'ข้อมูลนักเรียน',
  '/classrooms': 'ห้องเรียน',
  '/reports': 'รายงาน',
}

interface HeaderProps { title: string }

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] ?? title

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/50 dark:border-gray-700/50 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30 shadow-sm shadow-gray-100/50 dark:shadow-gray-900/50">
      <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent flex-1">
        {pageTitle}
      </h1>

      <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl px-3 py-1.5 border border-gray-200/50 dark:border-gray-700/50">
        {formatThaiDate(new Date().toISOString())}
      </span>

      <Button
        variant="ghost" size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="สลับธีม"
        className="rounded-xl w-9 h-9 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50"
      >
        {theme === 'dark'
          ? <Sun className="w-4 h-4 text-amber-500" />
          : <Moon className="w-4 h-4 text-indigo-500" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<button className="rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="เมนูผู้ใช้" />}>
          <Avatar className="w-9 h-9 ring-2 ring-blue-200 dark:ring-blue-800 ring-offset-1 pointer-events-none">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">ค</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
          <DropdownMenuItem className="gap-2 cursor-pointer rounded-xl m-1 hover:bg-blue-50 dark:hover:bg-gray-800">
            <User className="w-4 h-4 text-blue-500" /> โปรไฟล์ครู
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-rose-600 rounded-xl m-1 hover:bg-rose-50 dark:hover:bg-gray-800">
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
