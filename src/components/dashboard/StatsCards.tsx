import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/types'

interface StatsCardsProps { stats: DashboardStats }

const cards = [
  { key: 'total' as const, label: 'นักเรียนทั้งหมด', icon: Users, bg: 'bg-blue-50', iconColor: 'text-blue-600', textColor: 'text-blue-700' },
  { key: 'present' as const, label: 'มาเรียนวันนี้', icon: CheckCircle2, bg: 'bg-emerald-50', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
  { key: 'absent' as const, label: 'ขาดเรียน', icon: XCircle, bg: 'bg-rose-50', iconColor: 'text-rose-600', textColor: 'text-rose-700' },
  { key: 'late' as const, label: 'มาสาย', icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600', textColor: 'text-amber-700' },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, bg, iconColor, textColor }) => {
        const value = stats[key]
        const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
        return (
          <Card key={key} className={`${bg} border-0 shadow-sm`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-8 h-8 ${iconColor}`} aria-hidden="true" />
              </div>
              <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
              {key !== 'total' && (
                <p className="text-xs text-gray-400 mt-1">{pct}% ของทั้งหมด</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
