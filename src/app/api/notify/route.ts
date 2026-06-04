import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/services/telegram'

export async function POST(request: NextRequest) {
  try {
    const { studentName, studentCode, classroom, checkType, status, time, imageUrl } = await request.json()
    if (!studentName) return NextResponse.json({ error: 'studentName required' }, { status: 400 })
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!chatId) return NextResponse.json({ error: 'TELEGRAM_CHAT_ID not set' }, { status: 500 })
    const checkInLabel = status === 'late' ? '🟠 เข้าเรียน (สาย)' : '🟢 เข้าเรียน'
    const label = checkType === 'check_in' ? checkInLabel : checkType === 'check_out' ? '🟡 ออกจากศูนย์' : '🔴 รับกลับบ้าน'
    const dateText = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    const lines = [
      `📢 <b>${studentName}</b>`,
      studentCode ? `รหัส: ${studentCode}` : '',
      classroom ? `ห้อง: ${classroom}` : '',
      `${label} เวลา ${time} น.`,
      `📅 ${dateText}`,
    ].filter(Boolean)
    await sendTelegramNotification({ chatId, message: lines.join('\n'), imageUrl })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram notify error:', error)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
