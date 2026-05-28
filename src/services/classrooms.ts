import { createBrowserClient } from './supabase'

export interface Classroom {
  id: string
  name: string
  description: string | null
  created_at: string
}

export async function getClassrooms(): Promise<Classroom[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('getClassrooms:', error.message); return [] }
  return (data ?? []) as Classroom[]
}

export async function createClassroom(name: string, description?: string): Promise<Classroom> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('classrooms')
    .insert({ name: name.trim(), description: description?.trim() || null })
    .select()
    .single()
  if (error) throw error
  return data as Classroom
}

export async function deleteClassroom(id: string): Promise<void> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from('classrooms').delete().eq('id', id)
  if (error) throw error
}
