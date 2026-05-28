'use client'
import { useAttendance } from '@/hooks/useAttendance'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { AttendanceChart } from '@/components/dashboard/AttendanceChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMockStats } from '@/lib/mock-data'
import { formatThaiDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { stats, loading } = useAttendance()
  const displayStats = stats ?? getMockStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          สวัสดี! วันนี้เด็กๆ เป็นอย่างไรบ้าง?
        </h2>
        <p className="text-gray-500 mt-1">{formatThaiDate(new Date().toISOString())}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <StatsCards stats={displayStats} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-0 bg-white dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">
              สถิติการมาเรียน 7 วันล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">
              กิจกรรมล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
