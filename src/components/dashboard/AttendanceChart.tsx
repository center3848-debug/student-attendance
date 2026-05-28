'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const thaiDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์']

function genData() {
  return thaiDays.map((day) => ({
    day,
    มาเรียน: Math.floor(Math.random() * 4) + 14,
    ขาดเรียน: Math.floor(Math.random() * 3) + 1,
    มาสาย: Math.floor(Math.random() * 3) + 1,
  }))
}

interface TooltipPayload { name: string; value: number; color: string }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-4 text-sm">
      <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600 dark:text-gray-300">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{p.value} คน</span>
        </div>
      ))}
    </div>
  )
}

export function AttendanceChart() {
  const data = genData()
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barGap={2} barCategoryGap="25%">
          <defs>
            <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="gradLate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'var(--font-sarabun)', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 8 }} />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-sarabun)', fontSize: '13px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
          <Bar dataKey="มาเรียน" fill="url(#gradPresent)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={800} />
          <Bar dataKey="ขาดเรียน" fill="url(#gradAbsent)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={900} />
          <Bar dataKey="มาสาย" fill="url(#gradLate)" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
