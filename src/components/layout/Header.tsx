'use client'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/services/supabase'
import { formatThaiDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps { title: string }

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 gap-4 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1">{title}</h1>
      <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
        {formatThaiDate(new Date().toISOString())}
      </span>
      <Button
        variant="ghost" size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="สลับธีม"
        className="rounded-xl"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<button className="rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="เมนูผู้ใช้" />}>
          <Avatar className="w-9 h-9 pointer-events-none">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">ครู</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <User className="w-4 h-4" /> โปรไฟล์
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-rose-600">
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
