'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const thaiDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์', 'อาทิตย์']

function getMockWeekData() {
  return thaiDays.map((day) => ({
    day,
    มาเรียน: Math.floor(Math.random() * 5) + 13,
    ขาดเรียน: Math.floor(Math.random() * 3) + 1,
    มาสาย: Math.floor(Math.random() * 3) + 1,
  }))
}

export function AttendanceChart() {
  const data = getMockWeekData()
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'var(--font-sarabun)' }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ fontFamily: 'var(--font-sarabun)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'var(--font-sarabun)', fontSize: '13px' }} />
          <Bar dataKey="มาเรียน" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ขาดเรียน" fill="#FB7185" radius={[4, 4, 0, 0]} />
          <Bar dataKey="มาสาย" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
