import { CheckCircle2, LogOut, Car, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckType } from '@/types'

interface CheckInButtonProps {
  checkType: CheckType
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

const config: Record<CheckType, { label: string; icon: React.ElementType; className: string }> = {
  check_in: { label: 'เช็คชื่อเข้า', icon: CheckCircle2, className: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  check_out: { label: 'เช็คชื่อออก', icon: LogOut, className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  pickup: { label: 'รับกลับบ้าน', icon: Car, className: 'bg-purple-500 hover:bg-purple-600 text-white' },
}

export function CheckInButton({ checkType, onPress, loading = false, disabled = false }: CheckInButtonProps) {
  const { label, icon: Icon, className } = config[checkType]
  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 min-h-[3.5rem] px-4 py-2 rounded-2xl text-base font-semibold w-full transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        className
      )}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
      <span>{loading ? 'กำลังบันทึก...' : label}</span>
    </button>
  )
}
