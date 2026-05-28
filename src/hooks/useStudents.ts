'use client'
import { useEffect, useState, useMemo } from 'react'
import { getStudents } from '@/services/students'
import type { Student } from '@/types'

export function useStudents(classroomFilter?: string) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStudents().then(data => { setStudents(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let result = students
    if (classroomFilter) result = result.filter(s => s.classroom === classroomFilter)
    if (search) result = result.filter(s =>
      s.fullname.includes(search) || s.student_code.includes(search)
    )
    return result
  }, [students, classroomFilter, search])

  return { students: filtered, allStudents: students, loading, search, setSearch }
}
