import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThaiDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatThaiTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit',
  })
}
