'use client'
import { useEffect, useState } from 'react'
import { UtensilsCrossed, Plus, Trash2, CheckCircle2, AlertTriangle, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LunchInspectionForm } from '@/components/lunch/LunchInspectionForm'
import { LunchInspectionDetail } from '@/components/lunch/LunchInspectionDetail'
import { formatThaiDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  getLunchInspections,
  createLunchInspection,
  updateLunchInspection,
  deleteLunchInspection,
  type LunchInspection,
  type LunchInspectionInput,
  type LunchItemValue,
  type DualItem,
} from '@/services/lunch'

function isDual(v: LunchItemValue): v is DualItem {
  return (v as DualItem).food !== undefined
}

/** Count failed (ไม่ตรง) checks across all criteria of one inspection. */
function countIssues(items: Record<string, LunchItemValue>): number {
  let issues = 0
  for (const v of Object.values(items)) {
    if (isDual(v)) {
      if (!v.food.pass) issues++
      if (!v.dessert.pass) issues++
    } else if (!v.pass) {
      issues++
    }
  }
  return issues
}

export default function LunchCheckPage() {
  const [mode, setMode] = useState<'list' | 'new'>('list')
  const [inspections, setInspections] = useState<LunchInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewItem, setViewItem] = useState<LunchInspection | null>(null)
  const [editItem, setEditItem] = useState<LunchInspection | null>(null)

  async function load() {
    setLoading(true)
    setInspections(await getLunchInspections())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(data: LunchInspectionInput) {
    setSaving(true)
    try {
      if (editItem) {
        await updateLunchInspection(editItem.id, data)
        toast.success('แก้ไขแบบตรวจเรียบร้อย')
      } else {
        await createLunchInspection(data)
        toast.success('บันทึกแบบตรวจเรียบร้อย')
      }
      setMode('list')
      setEditItem(null)
      load()
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: LunchInspection) {
    setViewItem(null)
    setEditItem(item)
    setMode('new')
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteLunchInspection(deleteId)
      toast.success('ลบแบบตรวจเรียบร้อย')
      load()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setDeleteId(null)
    }
  }

  if (mode === 'new') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {editItem ? 'แก้ไขแบบตรวจอาหารกลางวัน' : 'แบบตรวจโครงการอาหารกลางวัน'}
          </h2>
          <p className="text-gray-500 mt-1">สำหรับผู้ควบคุมและคณะกรรมการตรวจประกอบอาหาร</p>
        </div>
        <LunchInspectionForm
          onSubmit={handleSubmit}
          onCancel={() => { setMode('list'); setEditItem(null) }}
          loading={saving}
          initialData={editItem}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ตรวจอาหารกลางวัน</h2>
          <p className="text-gray-500 mt-1">ทั้งหมด {inspections.length} รายการ</p>
        </div>
        <Button onClick={() => setMode('new')} className="h-12 rounded-2xl gap-2 bg-blue-600 hover:bg-blue-700 text-base">
          <Plus className="w-5 h-5" aria-hidden="true" />
          เพิ่มแบบตรวจ
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : inspections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          </div>
          <p className="text-base">ยังไม่มีแบบตรวจ</p>
          <Button onClick={() => setMode('new')} variant="outline" className="mt-4 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> เพิ่มแบบตรวจแรก
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspections.map(item => {
            const issues = countIssues(item.items)
            return (
              <Card
                key={item.id}
                onClick={() => setViewItem(item)}
                className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 group cursor-pointer"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="w-4 h-4" aria-hidden="true" />
                      {formatThaiDate(`${item.inspect_date}T00:00:00Z`)}
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(item.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg text-gray-400 hover:text-rose-500"
                      aria-label="ลบแบบตรวจ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-400">อาหาร:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{item.food_menu || '—'}</span></p>
                    <p className="text-sm"><span className="text-gray-400">ขนม/ผลไม้:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{item.dessert_menu || '—'}</span></p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {issues === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> ผ่านทุกข้อ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                        <AlertTriangle className="w-4 h-4" /> มีข้อที่ต้องปรับปรุง {issues} จุด
                      </span>
                    )}
                    {(item.recorder1 || item.recorder2) && (
                      <span className="text-xs text-gray-400 truncate max-w-[45%] text-right">
                        {[item.recorder1, item.recorder2].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <LunchInspectionDetail
        inspection={viewItem}
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        onEdit={startEdit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>ลบแบบตรวจ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบแบบตรวจนี้ใช่ไหม? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700">ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
