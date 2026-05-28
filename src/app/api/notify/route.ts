import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/services/telegram'

export async function POST(request: NextRequest) {
  try {
    const { chatId, studentName, checkType, time, imageUrl } = await request.json()
    if (!chatId || !studentName) return NextResponse.json({ error: 'chatId and studentName required' }, { status: 400 })
    const label = checkType === 'check_in' ? 'เข้าเรียน' : checkType === 'check_out' ? 'ออกจากศูนย์' : 'ถูกรับกลับบ้าน'
    await sendTelegramNotification({ chatId, message: `📢 <b>${studentName}</b>\n${label} เวลา ${time}`, imageUrl })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram notify error:', error)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
