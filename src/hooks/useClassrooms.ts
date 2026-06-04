'use client'
import { useEffect, useState } from 'react'
import { getClassrooms, type Classroom } from '@/services/classrooms'

export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getClassrooms().then(data => {
      if (active) { setClassrooms(data); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const names = classrooms.map(c => c.name)
  return { classrooms, names, loading }
}
