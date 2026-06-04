'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ScanLine, CameraOff, RefreshCw, CheckCircle2, XCircle, X } from 'lucide-react'
import jsQR from 'jsqr'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseQrPayload } from '@/lib/qr'
import { toast } from 'sonner'

export interface ScanResult {
  ok: boolean
  name: string
  message: string
}

interface QRScannerModalProps {
  open: boolean
  onClose: () => void
  modeLabel: string
  /** คืนผลการบันทึก เพื่อแสดง overlay ยืนยันให้ครู */
  onScan: (code: string) => Promise<ScanResult>
}

/** หน่วงการสแกนบัตรใบเดิมซ้ำ (มิลลิวินาที) — กันยิงซ้ำตอนจ่อค้าง */
const COOLDOWN_MS = 4000
const SCAN_INTERVAL_MS = 150

export function QRScannerModal({ open, onClose, modeLabel, onScan }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cooldownRef = useRef<Map<string, number>>(new Map())
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // เก็บ onScan เวอร์ชันล่าสุดไว้ใน ref กัน stale closure ใน loop
  const onScanRef = useRef(onScan)
  useEffect(() => { onScanRef.current = onScan }, [onScan])

  const [permissionDenied, setPermissionDenied] = useState(false)
  const [count, setCount] = useState(0)
  const [overlay, setOverlay] = useState<{ state: 'success' | 'error'; name: string; message: string } | null>(null)
  // เพิ่มค่าเพื่อสั่งเริ่มกล้องใหม่ (ปุ่ม "ลองใหม่")
  const [retryNonce, setRetryNonce] = useState(0)

  const stopStream = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const handleDecoded = useCallback(async (raw: string) => {
    const code = parseQrPayload(raw)
    if (!code) return
    const now = Date.now()
    const last = cooldownRef.current.get(code)
    if (last && now - last < COOLDOWN_MS) return
    cooldownRef.current.set(code, now)

    const res = await onScanRef.current(code)
    setOverlay({ state: res.ok ? 'success' : 'error', name: res.name, message: res.message })
    if (res.ok) setCount(c => c + 1)
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = setTimeout(() => setOverlay(null), 2200)
  }, [])

  // อ่านภาพหนึ่งเฟรมแล้วลอดถอด QR (เรียกเป็นช่วง ๆ ด้วย setInterval)
  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const result = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' })
    if (result?.data) handleDecoded(result.data)
  }, [handleDecoded])

  // เริ่มกล้อง + ลูปสแกน เมื่อเปิด modal (setState อยู่ใน callback ของ getUserMedia)
  useEffect(() => {
    if (!open) return
    let active = true
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        cooldownRef.current.clear()
        setPermissionDenied(false)
        setCount(0)
        setOverlay(null)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(scanFrame, SCAN_INTERVAL_MS)
      })
      .catch(() => {
        if (!active) return
        setPermissionDenied(true)
        toast.error('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง')
      })
    return () => {
      active = false
      stopStream()
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
    }
  }, [open, retryNonce, scanFrame, stopStream])

  function handleClose() {
    stopStream()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-600" aria-hidden="true" /> สแกน QR เช็คชื่อ
          </DialogTitle>
          <p className="text-gray-500 text-sm">
            โหมด: <span className="font-semibold text-blue-700">{modeLabel}</span>
            {count > 0 && <span className="ml-2 text-emerald-600">· บันทึกแล้ว {count} คน</span>}
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {permissionDenied ? (
            <div className="flex flex-col items-center py-10 text-gray-400 gap-3">
              <CameraOff className="w-16 h-16 text-gray-300" aria-hidden="true" />
              <p className="text-base text-center">ไม่สามารถเข้าถึงกล้องได้<br />กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์</p>
              <Button onClick={() => setRetryNonce(n => n + 1)} variant="outline" className="rounded-xl gap-2">
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> ลองใหม่
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* กรอบเล็ง */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-2xl border-4 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                </div>
                {/* overlay ยืนยันผล */}
                {overlay && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-white ${overlay.state === 'success' ? 'bg-emerald-600/85' : 'bg-rose-600/85'}`}>
                    {overlay.state === 'success'
                      ? <CheckCircle2 className="w-16 h-16" aria-hidden="true" />
                      : <XCircle className="w-16 h-16" aria-hidden="true" />}
                    <p className="text-xl font-bold">{overlay.name}</p>
                    <p className="text-sm">{overlay.message}</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <p className="text-center text-sm text-gray-400">จ่อบัตรนักเรียนให้อยู่ในกรอบ ระบบจะบันทึกอัตโนมัติ</p>
              <Button onClick={handleClose} variant="outline" className="w-full h-14 rounded-2xl gap-2 text-base">
                <X className="w-5 h-5" aria-hidden="true" /> เสร็จสิ้น
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
