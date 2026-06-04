import type { Student } from '@/types'
import { CENTER_NAME } from '@/components/students/StudentIdCard'

const W = 680
const H = 440
const FONT = "'Sarabun', 'Noto Sans Thai', sans-serif"

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** ลดขนาดฟอนต์ให้ข้อความพอดีกับความกว้าง maxWidth (มี minSize กันเล็กเกิน) */
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, weight: string, base: number, min: number) {
  let size = base
  ctx.font = `${weight} ${size}px ${FONT}`
  while (ctx.measureText(text).width > maxWidth && size > min) {
    size -= 1
    ctx.font = `${weight} ${size}px ${FONT}`
  }
  return size
}

/** วาดบัตรนักเรียนลง canvas แล้วคืนเป็น PNG Blob */
export async function renderCardImage(student: Student, qrDataUrl: string): Promise<Blob> {
  // รอฟอนต์ไทยพร้อมก่อนวาด ไม่งั้น canvas อาจ fallback เป็นฟอนต์อื่น
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try { await document.fonts.ready } catch { /* ข้ามได้ */ }
  }

  const qr = new Image()
  qr.src = qrDataUrl
  await qr.decode().catch(() => { /* ปล่อยให้วาดเท่าที่ได้ */ })

  const canvas = document.createElement('canvas')
  const dpr = 2
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas not supported')
  ctx.scale(dpr, dpr)

  // คลิปเป็นทรงบัตรมุมโค้ง เพื่อให้หัวบัตรโค้งตามขอบ
  ctx.save()
  roundRectPath(ctx, 1, 1, W - 2, H - 2, 32)
  ctx.clip()

  // พื้นขาว
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // หัวบัตร gradient อบอุ่น (amber → orange → rose)
  const headerH = 120
  const g = ctx.createLinearGradient(0, 0, W, headerH)
  g.addColorStop(0, '#fbbf24')
  g.addColorStop(0.5, '#fb923c')
  g.addColorStop(1, '#fb7185')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, headerH)

  // ข้อความหัวบัตร
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 28px ${FONT}`
  ctx.fillText('บัตรประจำตัวนักเรียน', 36, 52)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  fitFont(ctx, CENTER_NAME, W - 72, 'normal', 20, 13)
  ctx.fillText(CENTER_NAME, 36, 88)

  // ===== ตัวบัตร =====
  const qrSize = 170
  const qrX = W - 36 - qrSize
  const qrY = 150
  const leftMax = qrX - 36 - 24

  // ชื่อ
  ctx.fillStyle = '#1f2937'
  const nameSize = fitFont(ctx, student.fullname, leftMax, 'bold', 34, 20)
  ctx.fillText(student.fullname, 36, 150 + nameSize)

  // รหัส
  ctx.fillStyle = '#6b7280'
  ctx.font = `22px ${FONT}`
  ctx.fillText(`รหัส: ${student.student_code}`, 36, 150 + nameSize + 40)

  // ป้ายห้องเรียน
  ctx.font = `20px ${FONT}`
  const roomText = student.classroom
  const roomW = ctx.measureText(roomText).width
  const pillX = 36, pillY = 150 + nameSize + 64, pillH = 40, padX = 18
  ctx.fillStyle = '#fef3c7'
  roundRectPath(ctx, pillX, pillY, roomW + padX * 2, pillH, pillH / 2)
  ctx.fill()
  ctx.fillStyle = '#92400e'
  ctx.fillText(roomText, pillX + padX, pillY + 27)

  // กรอบ QR + รูป
  ctx.fillStyle = '#ffffff'
  roundRectPath(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#fde68a'
  roundRectPath(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16)
  ctx.stroke()
  if (qr.complete && qr.naturalWidth) ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  // คำกำกับใต้ QR
  ctx.fillStyle = '#9ca3af'
  ctx.font = `16px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('สแกนเพื่อเช็คชื่อ', qrX + qrSize / 2, qrY + qrSize + 26)
  ctx.textAlign = 'left'

  ctx.restore()

  // เส้นขอบบัตร
  roundRectPath(ctx, 1, 1, W - 2, H - 2, 32)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#fcd34d'
  ctx.stroke()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob failed'))
    }, 'image/png')
  })
}

/** เรนเดอร์บัตรเป็นรูปแล้วสั่งดาวน์โหลด */
export async function downloadCardImage(student: Student, qrDataUrl: string) {
  const blob = await renderCardImage(student, qrDataUrl)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `card-${student.student_code}.png`
  a.click()
  URL.revokeObjectURL(url)
}
