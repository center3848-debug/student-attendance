import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToDrive } from '@/services/drive'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImageToDrive(buffer, `attendance_${Date.now()}.jpg`)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Drive upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
