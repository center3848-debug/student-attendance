'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, CalendarDays, Pencil } from 'lucide-react'
import { formatThaiDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  LUNCH_CRITERIA,
  type LunchInspection,
  type LunchItemValue,
  type DualItem,
  type SubCheck,
} from '@/services/lunch'

function isDual(v: LunchItemValue): v is DualItem {
  return (v as DualItem).food !== undefined
}

function CheckLine({ label, check, passLabel, failLabel }: {
  label?: string
  check: SubCheck
  passLabel: string
  failLabel: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        {label && <span className="text-sm text-gray-500 w-20 flex-shrink-0">{label}</span>}
        <span className={cn(
          'inline-flex items-center gap-1 text-sm font-medium',
          check.pass ? 'text-emerald-600' : 'text-rose-500'
        )}>
          {check.pass ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {check.pass ? passLabel : failLabel}
        </span>
      </div>
      {!check.pass && check.reason && (
        <p className="text-sm text-rose-500/90 pl-0 sm:pl-[5.5rem]">เพราะ: {check.reason}</p>
      )}
    </div>
  )
}

export function LunchInspectionDetail({ inspection, open, onClose, onEdit }: {
  inspection: LunchInspection | null
  open: boolean
  onClose: () => void
  onEdit?: (inspection: LunchInspection) => void
}) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            แบบตรวจโครงการอาหารกลางวัน
          </DialogTitle>
        </DialogHeader>

        {inspection && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              {formatThaiDate(`${inspection.inspect_date}T00:00:00Z`)}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-1">
              <p className="text-sm"><span className="text-gray-400">อาหารวันนี้:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{inspection.food_menu || '—'}</span></p>
              <p className="text-sm"><span className="text-gray-400">ขนม/ผลไม้:</span> <span className="font-medium text-gray-800 dark:text-gray-100">{inspection.dessert_menu || '—'}</span></p>
            </div>

            <div className="space-y-3">
              {LUNCH_CRITERIA.map(c => {
                const value = inspection.items?.[c.no]
                if (!value) return null
                return (
                  <div key={c.no} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{c.no}. {c.label}</p>
                    {c.dual && isDual(value) ? (
                      <div className="space-y-2">
                        <CheckLine label="อาหาร" check={value.food} passLabel={c.passLabel} failLabel={c.failLabel} />
                        <CheckLine label="ขนม/ผลไม้" check={value.dessert} passLabel={c.passLabel} failLabel={c.failLabel} />
                      </div>
                    ) : !c.dual && !isDual(value) ? (
                      <CheckLine check={value} passLabel={c.passLabel} failLabel={c.failLabel} />
                    ) : null}
                  </div>
                )
              })}
            </div>

            {inspection.suggestion && (
              <div className="bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">ข้อเสนอแนะ</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{inspection.suggestion}</p>
              </div>
            )}

            {(inspection.recorder1 || inspection.recorder2) && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                {[inspection.recorder1, inspection.recorder2].filter(Boolean).map((name, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-gray-400">ผู้บันทึก: </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{name}</span>
                  </div>
                ))}
              </div>
            )}

            {onEdit && (
              <DialogFooter className="pt-2">
                <Button onClick={() => onEdit(inspection)} className="rounded-xl h-11 gap-2 bg-blue-600 hover:bg-blue-700">
                  <Pencil className="w-4 h-4" /> แก้ไขแบบตรวจ
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
