import { createBrowserClient } from './supabase'

export interface SubCheck {
  pass: boolean
  reason: string
}

/** Criteria 1–6 rate the main dish and the dessert/fruit separately. */
export interface DualItem {
  food: SubCheck
  dessert: SubCheck
}

/** Criterion 7 (cleanliness of the place) is a single pass/fail. */
export type SingleItem = SubCheck

export type LunchItemValue = DualItem | SingleItem

export interface LunchInspection {
  id: string
  inspect_date: string
  food_menu: string
  dessert_menu: string
  items: Record<string, LunchItemValue>
  suggestion: string
  recorder1: string
  recorder2: string
  created_at: string
}

export type LunchInspectionInput = Omit<LunchInspection, 'id' | 'created_at'>

export interface LunchCriterion {
  no: string
  label: string
  dual: boolean
  passLabel: string
  failLabel: string
}

/** Mirrors the paper "แบบตรวจโครงการอาหารกลางวัน". */
export const LUNCH_CRITERIA: LunchCriterion[] = [
  { no: '1', label: 'เมนูตรงตามรายการอาหารประจำสัปดาห์', dual: true, passLabel: 'ตรง', failLabel: 'ไม่ตรง' },
  { no: '2', label: 'ความสะอาดของอาหารเมื่อปรุงสุก', dual: true, passLabel: 'สะอาด', failLabel: 'ไม่สะอาด' },
  { no: '3', label: 'อาหารมีสีสันน่ารับประทาน', dual: true, passLabel: 'น่ารับประทาน', failLabel: 'ไม่น่ารับประทาน' },
  { no: '4', label: 'รสชาติของอาหาร', dual: true, passLabel: 'อร่อย', failLabel: 'ต้องปรับปรุง' },
  { no: '5', label: 'ปริมาณเพียงพอต่อนักเรียน', dual: true, passLabel: 'เพียงพอ', failLabel: 'ไม่เพียงพอ' },
  { no: '6', label: 'คุณค่าตามหลักโภชนาการครบถ้วน', dual: true, passLabel: 'ครบถ้วน', failLabel: 'ไม่ครบถ้วน' },
  { no: '7', label: 'ความสะอาดของสถานที่', dual: false, passLabel: 'สะอาด', failLabel: 'ไม่สะอาด' },
]

export function emptyLunchItems(): Record<string, LunchItemValue> {
  const items: Record<string, LunchItemValue> = {}
  for (const c of LUNCH_CRITERIA) {
    items[c.no] = c.dual
      ? { food: { pass: true, reason: '' }, dessert: { pass: true, reason: '' } }
      : { pass: true, reason: '' }
  }
  return items
}

export async function getLunchInspections(): Promise<LunchInspection[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('lunch_inspections')
    .select('*')
    .order('inspect_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) { console.error('getLunchInspections:', error.message); return [] }
  return (data ?? []) as LunchInspection[]
}

export async function createLunchInspection(payload: LunchInspectionInput): Promise<LunchInspection> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('lunch_inspections')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as LunchInspection
}

export async function updateLunchInspection(id: string, payload: LunchInspectionInput): Promise<LunchInspection> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('lunch_inspections')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as LunchInspection
}

export async function deleteLunchInspection(id: string): Promise<void> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from('lunch_inspections').delete().eq('id', id)
  if (error) throw error
}
