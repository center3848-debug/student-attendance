'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, BarChart3 } from 'lucide-react'
import { useAttendanceReport } from '@/hooks/useAttendanceReport'
import { useClassrooms } from '@/hooks/useClassrooms'
import { dailyBars, rangeDays, summarizeStudents, isEmptyBars, type ReportRange } from '@/lib/reports'

export default function ReportsPage() {
  const [range, setRange] = useState<ReportRange>('week')
  const [roomFilter, setRoomFilter] = useState<string>('ทั้งหมด')
  const { logs, students, loading } = useAttendanceReport(range)
  const { names: classroomNames } = useClassrooms()

  function handleRoomChange(value: string | null) { setRoomFilter(value ?? 'ทั้งหมด') }

  const days = rangeDays(range)
  const chartData = dailyBars(logs, days, students)
  const filteredStudents = roomFilter === 'ทั้งหมด'
    ? students
    : students.filter(s => s.classroom === roomFilter)
  const summary = summarizeStudents(filteredStudents, logs, days)

  const rangeLabel = range === 'today' ? 'วันนี้' : range === 'week' ? '7วันล่าสุด' : '30วันล่าสุด'

  function handleExport() {
    const header = ['ชื่อนักเรียน', 'ห้อง', 'มาเรียน(วัน)', 'ขาด(วัน)', 'มาสาย(วัน)', 'อัตราการมา(%)']
    const rows = summary.map(s => [s.name, s.classroom, s.present, s.absent, s.late, s.rate])
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
    // ﻿ = BOM so Excel reads Thai (UTF-8) correctly
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `รายงานการมาเรียน-${rangeLabel}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">รายงาน</h2>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={loading || summary.length === 0}
          className="rounded-xl h-11 gap-2"
          aria-label="ส่งออกรายงานเป็นไฟล์ CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" /> ส่งออก CSV
        </Button>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as ReportRange)}>
        <TabsList className="rounded-xl bg-gray-100 dark:bg-gray-800 h-11">
          <TabsTrigger value="today" className="rounded-lg">วันนี้</TabsTrigger>
          <TabsTrigger value="week" className="rounded-lg">7 วันล่าสุด</TabsTrigger>
          <TabsTrigger value="month" className="rounded-lg">30 วันล่าสุด</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">
            สถิติการมาเรียน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {loading ? (
              <Skeleton className="w-full h-full rounded-2xl" />
            ) : isEmptyBars(chartData) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-14 h-14 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <BarChart3 className="w-7 h-7 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">ยังไม่มีข้อมูลการมาเรียนในช่วงนี้</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'var(--font-sarabun)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontFamily: 'var(--font-sarabun)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontFamily: 'var(--font-sarabun)', fontSize: '13px' }} />
                  <Bar dataKey="มาเรียน" fill="#10B981" radius={[4,4,0,0]} />
                  <Bar dataKey="ขาดเรียน" fill="#FB7185" radius={[4,4,0,0]} />
                  <Bar dataKey="มาสาย" fill="#F59E0B" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-200">สรุปรายนักเรียน</CardTitle>
          <Select value={roomFilter} onValueChange={handleRoomChange}>
            <SelectTrigger className="w-36 h-9 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทุกห้อง</SelectItem>
              {classroomNames.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-base">ยังไม่มีข้อมูลนักเรียน</p>
            </div>
          ) : (
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
                  {summary.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
