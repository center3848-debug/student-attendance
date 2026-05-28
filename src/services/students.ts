import { createBrowserClient } from './supabase'
import type { Student } from '@/types'
import { MOCK_STUDENTS } from '@/lib/mock-data'

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function getStudents(): Promise<Student[]> {
  if (USE_MOCK) return MOCK_STUDENTS
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from('students').select('*').order('classroom').order('fullname')
  if (error) { console.error('getStudents:', error.message); return [] }
  return (data ?? []) as Student[]
}

export async function getStudentById(id: string): Promise<Student | null> {
  if (USE_MOCK) return MOCK_STUDENTS.find(s => s.id === id) ?? null
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
  if (error) return null
  return data as Student
}

export async function createStudent(payload: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from('students').insert(payload).select().single()
  if (error) throw error
  return data as Student
}

export async function updateStudent(id: string, payload: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from('students').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Student
}

export async function deleteStudent(id: string): Promise<void> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}
