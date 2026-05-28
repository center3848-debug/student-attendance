'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, RefreshCw, Check, X, CameraOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CameraModalProps {
  open: boolean
  onClose: () => void
  onCapture: (blob: Blob) => void
  studentName: string
}

export function CameraModal({ open, onClose, onCapture, studentName }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setPermissionDenied(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setPermissionDenied(true)
      toast.error('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง')
    }
  }, [])

  useEffect(() => {
    if (open) {
      setCaptured(null)
      setCapturedBlob(null)
      startCamera()
    } else {
      stopStream()
    }
    return () => stopStream()
  }, [open, startCamera, stopStream])

  function handleCapture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (blob) {
        setCapturedBlob(blob)
        setCaptured(canvas.toDataURL('image/jpeg'))
        stopStream()
      }
    }, 'image/jpeg', 0.85)
  }

  function handleRetake() {
    setCaptured(null)
    setCapturedBlob(null)
    startCamera()
  }

  function handleConfirm() {
    if (capturedBlob) {
      onCapture(capturedBlob)
      onClose()
    }
  }

  function handleClose() {
    setCaptured(null)
    setCapturedBlob(null)
    stopStream()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-800">
            ถ่ายรูปหลักฐาน
          </DialogTitle>
          <p className="text-gray-500 text-sm">นักเรียน: <span className="font-medium text-blue-700">{studentName}</span></p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {permissionDenied ? (
            <div className="flex flex-col items-center py-10 text-gray-400 gap-3">
              <CameraOff className="w-16 h-16 text-gray-300" aria-hidden="true" />
              <p className="text-base text-center">ไม่สามารถเข้าถึงกล้องได้<br/>กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์</p>
              <Button onClick={startCamera} variant="outline" className="rounded-xl gap-2">
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> ลองใหม่
              </Button>
            </div>
          ) : captured ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={captured} alt="รูปที่ถ่าย" className="w-full rounded-2xl object-cover" />
              <div className="flex gap-3">
                <Button onClick={handleRetake} variant="outline" className="flex-1 h-14 rounded-2xl gap-2 text-base">
                  <RefreshCw className="w-5 h-5" aria-hidden="true" /> ถ่ายใหม่
                </Button>
                <Button onClick={handleConfirm} className="flex-1 h-14 rounded-2xl gap-2 text-base bg-emerald-500 hover:bg-emerald-600">
                  <Check className="w-5 h-5" aria-hidden="true" /> ยืนยัน
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button onClick={handleClose} variant="outline" className="flex-1 h-14 rounded-2xl gap-2 text-base">
                  <X className="w-5 h-5" aria-hidden="true" /> ยกเลิก
                </Button>
                <Button onClick={handleCapture} className="flex-1 h-14 rounded-2xl gap-2 text-base bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-5 h-5" aria-hidden="true" /> ถ่ายรูป
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
