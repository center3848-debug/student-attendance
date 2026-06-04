'use client'
import { useState } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  LUNCH_CRITERIA,
  emptyLunchItems,
  type LunchInspection,
  type LunchInspectionInput,
  type LunchItemValue,
  type DualItem,
  type SubCheck,
} from '@/services/lunch'

interface Props {
  onSubmit: (data: LunchInspectionInput) => void
  onCancel: () => void
  loading: boolean
  initialData?: LunchInspection | null
}

function isDual(v: LunchItemValue): v is DualItem {
  return (v as DualItem).food !== undefined
}

function PassToggle({ value, passLabel, failLabel, onChange }: {
  value: boolean
  passLabel: string
  failLabel: string
  onChange: (pass: boolean) => void
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        aria-pressed={value}
        className={cn(
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border',
          value
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
        )}
      >
        {passLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        aria-pressed={!value}
        className={cn(
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border',
          !value
            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-rose-300'
        )}
      >
        {failLabel}
      </button>
    </div>
  )
}

function CheckRow({ label, check, passLabel, failLabel, onChange }: {
  label?: string
  check: SubCheck
  passLabel: string
  failLabel: string
  onChange: (next: SubCheck) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {label && <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>}
        <PassToggle
          value={check.pass}
          passLabel={passLabel}
          failLabel={failLabel}
          onChange={pass => onChange({ ...check, pass })}
        />
      </div>
      {!check.pass && (
        <Input
          value={check.reason}
          onChange={e => onChange({ ...check, reason: e.target.value })}
          placeholder="ระบุเหตุผล / สิ่งที่ต้องปรับปรุง..."
          className="h-11 rounded-xl text-base border-rose-200 focus:border-rose-400"
        />
      )}
    </div>
  )
}

export function LunchInspectionForm({ onSubmit, onCancel, loading, initialData }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [inspectDate, setInspectDate] = useState(initialData?.inspect_date ?? today)
  const [foodMenu, setFoodMenu] = useState(initialData?.food_menu ?? '')
  const [dessertMenu, setDessertMenu] = useState(initialData?.dessert_menu ?? '')
  const [items, setItems] = useState<Record<string, LunchItemValue>>(
    () => ({ ...emptyLunchItems(), ...(initialData?.items ?? {}) })
  )
  const [suggestion, setSuggestion] = useState(initialData?.suggestion ?? '')
  const [recorder1, setRecorder1] = useState(initialData?.recorder1 ?? '')
  const [recorder2, setRecorder2] = useState(initialData?.recorder2 ?? '')

  function updateItem(no: string, value: LunchItemValue) {
    setItems(prev => ({ ...prev, [no]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      inspect_date: inspectDate,
      food_menu: foodMenu.trim(),
      dessert_menu: dessertMenu.trim(),
      items,
      suggestion: suggestion.trim(),
      recorder1: recorder1.trim(),
      recorder2: recorder2.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="inspect-date" className="text-sm font-medium">วันที่ตรวจ</Label>
            <Input id="inspect-date" type="date" value={inspectDate} onChange={e => setInspectDate(e.target.value)} required className="h-12 rounded-xl text-base" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="food-menu" className="text-sm font-medium">อาหารวันนี้คือ</Label>
            <Input id="food-menu" value={foodMenu} onChange={e => setFoodMenu(e.target.value)} placeholder="เช่น ลาบหมู + แกงจืดผักกาดขาวหมูสับ" className="h-12 rounded-xl text-base" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dessert-menu" className="text-sm font-medium">ผลไม้/ขนมวันนี้คือ</Label>
            <Input id="dessert-menu" value={dessertMenu} onChange={e => setDessertMenu(e.target.value)} placeholder="เช่น เฉาก๊วย" className="h-12 rounded-xl text-base" />
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="space-y-3">
        {LUNCH_CRITERIA.map(c => {
          const value = items[c.no]
          return (
            <div key={c.no} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <p className="font-semibold text-gray-800 dark:text-gray-100">{c.no}. {c.label}</p>
              {c.dual && isDual(value) ? (
                <div className="space-y-3 pl-1">
                  <CheckRow label="อาหาร" check={value.food} passLabel={c.passLabel} failLabel={c.failLabel}
                    onChange={next => updateItem(c.no, { ...value, food: next })} />
                  <CheckRow label="ขนม/ผลไม้" check={value.dessert} passLabel={c.passLabel} failLabel={c.failLabel}
                    onChange={next => updateItem(c.no, { ...value, dessert: next })} />
                </div>
              ) : !c.dual && !isDual(value) ? (
                <CheckRow check={value} passLabel={c.passLabel} failLabel={c.failLabel}
                  onChange={next => updateItem(c.no, next)} />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Suggestion */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-2">
        <Label htmlFor="suggestion" className="text-sm font-medium">ข้อเสนอแนะ</Label>
        <textarea
          id="suggestion"
          value={suggestion}
          onChange={e => setSuggestion(e.target.value)}
          rows={3}
          placeholder="ข้อเสนอแนะเพิ่มเติม..."
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-base focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Recorders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="recorder1" className="text-sm font-medium">ผู้บันทึก (ชื่อ-สกุล)</Label>
          <Input id="recorder1" value={recorder1} onChange={e => setRecorder1(e.target.value)} placeholder="ชื่อ-สกุล" className="h-12 rounded-xl text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="recorder2" className="text-sm font-medium">ผู้บันทึก (ชื่อ-สกุล)</Label>
          <Input id="recorder2" value={recorder2} onChange={e => setRecorder2(e.target.value)} placeholder="ชื่อ-สกุล" className="h-12 rounded-xl text-base" />
        </div>
      </div>

      <div className="flex gap-3 sticky bottom-4">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-12 gap-2 flex-1">
          <X className="w-4 h-4" /> ยกเลิก
        </Button>
        <Button type="submit" disabled={loading} className="rounded-xl h-12 gap-2 flex-1 bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? 'บันทึกการแก้ไข' : 'บันทึกแบบตรวจ'}
        </Button>
      </div>
    </form>
  )
}
