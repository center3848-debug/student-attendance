import QRCode from 'qrcode'

/**
 * QR สำหรับบัตรนักเรียน: เก็บ "รหัสนักเรียน" (student_code) ตรง ๆ
 * — อ่านง่าย, ใช้ซ้ำได้แม้สร้างใหม่/กู้ฐานข้อมูล, ตรงกับเลขที่พิมพ์บนบัตร.
 *
 * ตอนสแกน เราจะนำค่าที่อ่านได้ไป map กับรายชื่อนักเรียนที่โหลดไว้แล้ว
 * (parseQrPayload) เพื่อกันการอ่าน QR แปลกปลอม.
 */
export function encodeQrPayload(studentCode: string): string {
  return studentCode.trim()
}

/** ดึงรหัสนักเรียนจากค่าที่สแกนได้ (รองรับเผื่อมีช่องว่าง/บรรทัด) */
export function parseQrPayload(raw: string): string {
  return raw.trim()
}

/** สร้าง QR เป็น data URL (PNG) สำหรับฝังในบัตร หรือดาวน์โหลด */
export async function generateQrDataUrl(text: string, size = 220): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#1f2937', light: '#ffffff' },
  })
}
