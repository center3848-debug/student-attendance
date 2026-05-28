'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MOCK_STUDENTS, MOCK_CLASSROOMS } from '@/lib/mock-data'

const thaiDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์']

function genWeekData() {
  return thaiDays.map(day => ({
    day,
    มาเรียน: Math.floor(Math.random() * 4) + 14,
    ขาดเรียน: Math.floor(Math.random() * 3) + 1,
    มาสาย: Math.floor(Math.random() * 3) + 1,
  }))
}

const summaryData = MOCK_STUDENTS.map((s, i) => ({
  name: s.fullname,
  classroom: s.classroom,
  present: 18 - (i % 3),
  absent: i % 3,
  late: (i + 1) % 3,
  rate: Math.round(((18 - (i % 3)) / 20) * 100),
}))

export default function ReportsPage() {
  const [roomFilter, setRoomFilter] = useState<string>('ทั้งหมด')
  function handleRoomChange(value: string | null) { setRoomFilter(value ?? 'ทั้งหมด') }
  const weekData = genWeekData()

  const filteredSummary = roomFilter === 'ทั้งหมด'
    ? summaryData
    : summaryData.filter(s => s.classroom === roomFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">รายงาน</h2>
        <Button variant="outline" className="rounded-xl h-11 gap-2 opacity-50 cursor-not-allowed" disabled aria-label="เร็วๆ นี้">
          <Download className="w-4 h-4" aria-hidden="true" /> ส่งออก (เร็วๆ นี้)
        </Button>
      </div>

      <Tabs defaultValue="week">
        <TabsList className="rounded-xl bg-gray-100 dark:bg-gray-800 h-11">
          <TabsTrigger value="today" className="rounded-lg">วันนี้</TabsTrigger>
          <TabsTrigger value="week" className="rounded-lg">สัปดาห์นี้</TabsTrigger>
          <TabsTrigger value="month" className="rounded-lg">เดือนนี้</TabsTrigger>
        </TabsList>

        {(['today', 'week', 'month'] as const).map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  สถิติการมาเรียน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'var(--font-sarabun)' }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontFamily: 'var(--font-sarabun)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ fontFamily: 'var(--font-sarabun)', fontSize: '13px' }} />
                      <Bar dataKey="มาเรียน" fill="#10B981" radius={[4,4,0,0]} />
                      <Bar dataKey="ขาดเรียน" fill="#FB7185" radius={[4,4,0,0]} />
                      <Bar dataKey="มาสาย" fill="#F59E0B" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">สรุปรายนักเรียน</CardTitle>
          <Select value={roomFilter} onValueChange={handleRoomChange}>
            <SelectTrigger className="w-36 h-9 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทุกห้อง</SelectItem>
              {MOCK_CLASSROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['ชื่อนักเรียน', 'ห้อง', 'มาเรียน', 'ขาดเรียน', 'มาสาย', 'อัตราการมา'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map(s => (
                  <tr key={s.name} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{s.name}</td>
                    <td className="px-3 py-2.5 text-gray-500">{s.classroom}</td>
                    <td className="px-3 py-2.5 text-emerald-600 font-medium">{s.present}</td>
                    <td className="px-3 py-2.5 text-rose-500">{s.absent}</td>
                    <td className="px-3 py-2.5 text-amber-500">{s.late}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${s.rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{s.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
