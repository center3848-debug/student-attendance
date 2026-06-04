'use client'
import { useEffect, useRef, useState } from 'react'
import { Printer, Download, ImageDown, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StudentIdCard } from './StudentIdCard'
import { encodeQrPayload, generateQrDataUrl } from '@/lib/qr'
import { downloadCardImage } from '@/lib/card-image'
import { printNode } from '@/lib/print'
import { toast } from 'sonner'
import type { Student } from '@/types'

interface IdCardDialogProps {
  open: boolean
  onClose: () => void
  students: Student[]
  title?: string
}

export function IdCardDialog({ open, onClose, students, title }: IdCardDialogProps) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || students.length === 0) return
    let cancelled = false
    Promise.all(
      students.map(async s => [s.id, await generateQrDataUrl(encodeQrPayload(s.student_code))] as const)
    ).then(entries => {
      if (!cancelled) setQrMap(Object.fromEntries(entries))
    })
    return () => { cancelled = true }
  }, [open, students])

  // กำลังโหลด = ยังสร้าง QR ของนักเรียนบางคนไม่เสร็จ
  const loading = students.length > 0 && students.some(s => !qrMap[s.id])

  function handlePrint() {
    if (printRef.current) printNode(printRef.current)
  }

  function downloadQr(student: Student) {
    const url = qrMap[student.id]
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${student.student_code}.png`
    a.click()
  }

  async function downloadCard(student: Student) {
    const url = qrMap[student.id]
    if (!url) return
    try {
      await downloadCardImage(student, url)
    } catch {
      toast.error('สร้างรูปบัตรไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
  }

  const single = students.length === 1

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {title ?? (single ? 'บัตรนักเรียน' : `บัตรนักเรียน ${students.length} คน`)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> กำลังสร้างบัตร...
          </div>
        ) : (
          <div ref={printRef} className="flex flex-wrap gap-4 justify-center py-2">
            {students.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <StudentIdCard student={s} qrDataUrl={qrMap[s.id] ?? null} />
                <div className="flex gap-2 no-print">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadCard(s)}
                    className="rounded-xl gap-2 h-10"
                  >
                    <ImageDown className="w-4 h-4" /> รูปบัตร
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadQr(s)}
                    className="rounded-xl gap-2 h-10"
                  >
                    <Download className="w-4 h-4" /> QR
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12">ปิด</Button>
          <Button type="button" onClick={handlePrint} disabled={loading} className="rounded-xl h-12 gap-2 bg-amber-500 hover:bg-amber-600 min-w-[140px]">
            <Printer className="w-5 h-5" /> พิมพ์บัตร
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
