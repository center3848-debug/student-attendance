import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'ระบบลงเวลา | ศูนย์การศึกษาพิเศษ ปทุมธานี',
  description: 'ระบบลงเวลาเข้าเรียนและรับส่งนักเรียน ศูนย์การศึกษาพิเศษ ประจำจังหวัดปทุมธานี',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
