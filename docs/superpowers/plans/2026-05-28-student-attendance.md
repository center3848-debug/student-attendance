# Student Attendance & Pickup System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **UI/UX:** Use `ui-ux-pro-max` skill for every page and component.
> **Verification:** Spawn sub-agents to verify each completed task.

**Goal:** Build a Thai school attendance web app where teachers check students in/out via camera, upload photos to Google Drive, record to Supabase, and notify parents via Telegram.

**Architecture:** All-in-One Next.js 15 App Router. API Routes handle Google Drive upload and Telegram as server-side BFF (credentials never exposed to client). Supabase client SDK handles real-time subscriptions and auth directly.

**Tech Stack:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Supabase, Google Drive API, Telegram Bot API, Vercel, Vitest, React Testing Library

---

## File Map

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── students/page.tsx
│   │   ├── students/[id]/page.tsx
│   │   ├── classrooms/page.tsx
│   │   └── reports/page.tsx
│   ├── api/upload-drive/route.ts
│   ├── api/notify/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/Header.tsx
│   ├── layout/MobileNav.tsx
│   ├── attendance/AttendanceTable.tsx
│   ├── attendance/CameraModal.tsx
│   ├── attendance/CheckInButton.tsx
│   ├── attendance/StatusBadge.tsx
│   ├── dashboard/StatsCards.tsx
│   ├── dashboard/AttendanceChart.tsx
│   ├── dashboard/RecentActivity.tsx
│   ├── students/StudentCard.tsx
│   └── students/StudentForm.tsx
├── services/
│   ├── supabase.ts
│   ├── attendance.ts
│   ├── students.ts
│   ├── drive.ts          (server-only)
│   └── telegram.ts       (server-only)
├── hooks/
│   ├── useAttendance.ts
│   └── useStudents.ts
├── types/index.ts
├── lib/
│   ├── mock-data.ts
│   └── utils.ts
└── middleware.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create Next.js 15 project**

```bash
cd "C:\Users\preec\OneDrive\Desktop\ระบบลงเวลานักเรียน"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Next.js 15 project scaffolded in current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install recharts
npm install sharp
npm install googleapis
npm install @types/node
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, yes CSS variables.

- [ ] **Step 4: Add required shadcn components**

```bash
npx shadcn@latest add button card badge dialog table input label toast avatar dropdown-menu sheet skeleton tabs select
```

- [ ] **Step 5: Create `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Drive
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Mock data flag
USE_MOCK=true
```

- [ ] **Step 6: Configure vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project with Supabase, shadcn/ui, Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { Student, AttendanceLog, AppUser, CheckType, AttendanceStatus } from '@/types'

describe('types', () => {
  it('Student type has required fields', () => {
    const s: Student = {
      id: '1',
      student_code: 'ST001',
      fullname: 'สมชาย ใจดี',
      classroom: 'ป.1/1',
      parent_name: 'นางสาว ใจดี',
      parent_phone: '0812345678',
      profile_image_url: null,
      created_at: new Date().toISOString(),
    }
    expect(s.student_code).toBe('ST001')
  })

  it('AttendanceLog type has required fields', () => {
    const log: AttendanceLog = {
      id: '1',
      student_id: 'st1',
      check_type: 'check_in',
      image_url: null,
      timestamp: new Date().toISOString(),
      device_name: 'iPad',
      status: 'present',
    }
    expect(log.check_type).toBe('check_in')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/test/types.test.ts
```

Expected: FAIL — `@/types` not found.

- [ ] **Step 3: Create `src/types/index.ts`**

```typescript
export type CheckType = 'check_in' | 'check_out' | 'pickup'
export type AttendanceStatus = 'present' | 'absent' | 'late'
export type UserRole = 'teacher' | 'admin'

export interface Student {
  id: string
  student_code: string
  fullname: string
  classroom: string
  parent_name: string
  parent_phone: string
  profile_image_url: string | null
  created_at: string
}

export interface AttendanceLog {
  id: string
  student_id: string
  check_type: CheckType
  image_url: string | null
  timestamp: string
  device_name: string
  status: AttendanceStatus
  student?: Student
}

export interface AppUser {
  id: string
  fullname: string
  email: string
  role: UserRole
  school_id: string | null
  created_at: string
}

export interface DashboardStats {
  total: number
  present: number
  absent: number
  late: number
  date: string
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm run test:run -- src/test/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/test/types.test.ts vitest.config.ts src/test/setup.ts
git commit -m "feat: add TypeScript types for Student, AttendanceLog, AppUser"
```

---

## Task 3: Supabase Setup & Services

**Files:**
- Create: `src/services/supabase.ts`
- Create: `src/lib/supabase-server.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/supabase.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createBrowserClient } from '@/services/supabase'

describe('supabase client', () => {
  it('createBrowserClient returns an object with from()', () => {
    const client = createBrowserClient()
    expect(typeof client.from).toBe('function')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/test/supabase.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/services/supabase.ts`**

```typescript
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Student, AttendanceLog, AppUser } from '@/types'

export function createBrowserClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type { Student, AttendanceLog, AppUser }
```

- [ ] **Step 4: Create `src/lib/supabase-server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm run test:run -- src/test/supabase.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/supabase.ts src/lib/supabase-server.ts src/test/supabase.test.ts
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 4: Database Schema (Supabase SQL)

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create schema SQL file**

Create `supabase/schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type check_type as enum ('check_in', 'check_out', 'pickup');
create type attendance_status as enum ('present', 'absent', 'late');
create type user_role as enum ('teacher', 'admin');

-- Users table (mirrors Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  fullname text not null,
  email text not null,
  role user_role not null default 'teacher',
  school_id uuid,
  created_at timestamptz not null default now()
);

-- Students table
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  student_code text not null unique,
  fullname text not null,
  classroom text not null,
  parent_name text not null default '',
  parent_phone text not null default '',
  profile_image_url text,
  created_at timestamptz not null default now()
);

-- Attendance logs table
create table public.attendance_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  check_type check_type not null,
  image_url text,
  timestamp timestamptz not null default now(),
  device_name text not null default '',
  status attendance_status not null default 'present'
);

-- Indexes
create index attendance_logs_student_id_idx on public.attendance_logs(student_id);
create index attendance_logs_timestamp_idx on public.attendance_logs(timestamp desc);

-- RLS
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.attendance_logs enable row level security;

-- Policies: authenticated users can read/write all (teacher role)
create policy "authenticated read students" on public.students
  for select to authenticated using (true);

create policy "authenticated write students" on public.students
  for all to authenticated using (true) with check (true);

create policy "authenticated read attendance" on public.attendance_logs
  for select to authenticated using (true);

create policy "authenticated write attendance" on public.attendance_logs
  for all to authenticated using (true) with check (true);

create policy "users read own" on public.users
  for select to authenticated using (auth.uid() = id);

-- Realtime
alter publication supabase_realtime add table public.attendance_logs;
```

- [ ] **Step 2: Run schema in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste contents of `supabase/schema.sql` → Run.

Expected: All tables created without errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase database schema with RLS policies"
```

---

## Task 5: Mock Data

**Files:**
- Create: `src/lib/mock-data.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/mock-data.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { MOCK_STUDENTS, MOCK_ATTENDANCE_LOGS, getMockStats } from '@/lib/mock-data'

describe('mock data', () => {
  it('has 20 students', () => {
    expect(MOCK_STUDENTS).toHaveLength(20)
  })

  it('has 3 classrooms', () => {
    const classrooms = [...new Set(MOCK_STUDENTS.map(s => s.classroom))]
    expect(classrooms).toHaveLength(3)
  })

  it('getMockStats returns correct totals', () => {
    const stats = getMockStats()
    expect(stats.total).toBe(20)
    expect(stats.present + stats.absent + stats.late).toBe(20)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/test/mock-data.test.ts
```

- [ ] **Step 3: Create `src/lib/mock-data.ts`**

```typescript
import type { Student, AttendanceLog, DashboardStats } from '@/types'

export const MOCK_STUDENTS: Student[] = [
  { id: 'st-01', student_code: 'ST001', fullname: 'สมชาย ใจดี', classroom: 'ป.1/1', parent_name: 'นางสาว ใจดี', parent_phone: '0812345678', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-02', student_code: 'ST002', fullname: 'นภา รักเรียน', classroom: 'ป.1/1', parent_name: 'นาย รักเรียน', parent_phone: '0823456789', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-03', student_code: 'ST003', fullname: 'วิชัย มั่นคง', classroom: 'ป.1/1', parent_name: 'นาง มั่นคง', parent_phone: '0834567890', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-04', student_code: 'ST004', fullname: 'พิมพ์ใจ สดใส', classroom: 'ป.1/1', parent_name: 'นาย สดใส', parent_phone: '0845678901', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-05', student_code: 'ST005', fullname: 'ธนพล เก่งกาจ', classroom: 'ป.1/1', parent_name: 'นาง เก่งกาจ', parent_phone: '0856789012', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-06', student_code: 'ST006', fullname: 'กัญญา สุขสม', classroom: 'ป.1/1', parent_name: 'นาย สุขสม', parent_phone: '0867890123', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-07', student_code: 'ST007', fullname: 'อนันต์ ดีงาม', classroom: 'ป.1/1', parent_name: 'นาง ดีงาม', parent_phone: '0878901234', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-08', student_code: 'ST008', fullname: 'มาลี วงษ์ทอง', classroom: 'ป.1/2', parent_name: 'นาย วงษ์ทอง', parent_phone: '0889012345', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-09', student_code: 'ST009', fullname: 'ปิยะ แก้วใส', classroom: 'ป.1/2', parent_name: 'นาง แก้วใส', parent_phone: '0890123456', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-10', student_code: 'ST010', fullname: 'สุดา ทองดี', classroom: 'ป.1/2', parent_name: 'นาย ทองดี', parent_phone: '0801234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-11', student_code: 'ST011', fullname: 'ชัยวัฒน์ ศรีสุข', classroom: 'ป.1/2', parent_name: 'นาง ศรีสุข', parent_phone: '0811234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-12', student_code: 'ST012', fullname: 'นันทิดา พรมมา', classroom: 'ป.1/2', parent_name: 'นาย พรมมา', parent_phone: '0821234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-13', student_code: 'ST013', fullname: 'รัตนา จันทร์เพ็ง', classroom: 'ป.1/2', parent_name: 'นาง จันทร์เพ็ง', parent_phone: '0831234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-14', student_code: 'ST014', fullname: 'สิทธิชัย บุญมาก', classroom: 'ป.1/2', parent_name: 'นาย บุญมาก', parent_phone: '0841234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-15', student_code: 'ST015', fullname: 'วนิดา คงคา', classroom: 'ป.2/1', parent_name: 'นาง คงคา', parent_phone: '0851234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-16', student_code: 'ST016', fullname: 'ประสิทธิ์ ยิ้มแย้ม', classroom: 'ป.2/1', parent_name: 'นาย ยิ้มแย้ม', parent_phone: '0861234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-17', student_code: 'ST017', fullname: 'กมลา สว่างใจ', classroom: 'ป.2/1', parent_name: 'นาง สว่างใจ', parent_phone: '0871234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-18', student_code: 'ST018', fullname: 'ธีระ ขยันทำ', classroom: 'ป.2/1', parent_name: 'นาย ขยันทำ', parent_phone: '0881234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-19', student_code: 'ST019', fullname: 'พรทิพย์ นาคา', classroom: 'ป.2/1', parent_name: 'นาง นาคา', parent_phone: '0891234567', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'st-20', student_code: 'ST020', fullname: 'สมหมาย ใจกว้าง', classroom: 'ป.2/1', parent_name: 'นาย ใจกว้าง', parent_phone: '0802345678', profile_image_url: null, created_at: '2026-01-01T00:00:00Z' },
]

export const MOCK_CLASSROOMS = ['ป.1/1', 'ป.1/2', 'ป.2/1']

const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'late', 'absent', 'absent', 'present', 'present', 'present', 'present', 'present', 'late', 'absent', 'present', 'present']

export const MOCK_ATTENDANCE_LOGS: AttendanceLog[] = MOCK_STUDENTS.map((s, i) => ({
  id: `log-${i + 1}`,
  student_id: s.id,
  check_type: 'check_in',
  image_url: null,
  timestamp: new Date().toISOString(),
  device_name: 'Mock Device',
  status: statuses[i],
  student: s,
}))

export function getMockStats(): DashboardStats {
  const present = statuses.filter(s => s === 'present').length
  const absent = statuses.filter(s => s === 'absent').length
  const late = statuses.filter(s => s === 'late').length
  return {
    total: MOCK_STUDENTS.length,
    present,
    absent,
    late,
    date: new Date().toISOString().split('T')[0],
  }
}
```

- [ ] **Step 4: Create `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThaiDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatThaiTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm run test:run -- src/test/mock-data.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/mock-data.ts src/lib/utils.ts src/test/mock-data.test.ts
git commit -m "feat: add mock data (20 students, 3 classrooms) and utility functions"
```

---

## Task 6: Attendance & Student Services

**Files:**
- Create: `src/services/attendance.ts`
- Create: `src/services/students.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/services.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getAttendanceByDate, createAttendanceLog } from '@/services/attendance'
import { getStudents, getStudentById } from '@/services/students'
import { MOCK_ATTENDANCE_LOGS, MOCK_STUDENTS } from '@/lib/mock-data'

vi.mock('@/services/supabase', () => ({
  createBrowserClient: () => ({
    from: (table: string) => ({
      select: () => ({ eq: () => ({ data: MOCK_ATTENDANCE_LOGS, error: null }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: MOCK_ATTENDANCE_LOGS[0], error: null }) }) }),
    }),
  }),
}))

describe('attendance service', () => {
  it('getAttendanceByDate returns logs', async () => {
    const result = await getAttendanceByDate('2026-05-28')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('student service', () => {
  it('getStudents returns array', async () => {
    const result = await getStudents()
    expect(Array.isArray(result)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test:run -- src/test/services.test.ts
```

- [ ] **Step 3: Create `src/services/attendance.ts`**

```typescript
import { createBrowserClient } from './supabase'
import type { AttendanceLog, CheckType, AttendanceStatus } from '@/types'
import { MOCK_ATTENDANCE_LOGS } from '@/lib/mock-data'

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function getAttendanceByDate(date: string): Promise<AttendanceLog[]> {
  if (USE_MOCK) return MOCK_ATTENDANCE_LOGS

  const supabase = createBrowserClient()
  const start = `${date}T00:00:00Z`
  const end = `${date}T23:59:59Z`

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, student:students(*)')
    .gte('timestamp', start)
    .lte('timestamp', end)
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data as AttendanceLog[]
}

export async function createAttendanceLog(payload: {
  student_id: string
  check_type: CheckType
  image_url: string | null
  device_name: string
  status: AttendanceStatus
}): Promise<AttendanceLog> {
  if (USE_MOCK) {
    return { id: crypto.randomUUID(), ...payload, timestamp: new Date().toISOString() } as AttendanceLog
  }

  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .insert(payload)
    .select('*, student:students(*)')
    .single()

  if (error) throw error
  return data as AttendanceLog
}

export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const logs = await getAttendanceByDate(today)
  return {
    total: logs.length,
    present: logs.filter(l => l.status === 'present').length,
    absent: logs.filter(l => l.status === 'absent').length,
    late: logs.filter(l => l.status === 'late').length,
    date: today,
  }
}
```

- [ ] **Step 4: Create `src/services/students.ts`**

```typescript
import { createBrowserClient } from './supabase'
import type { Student } from '@/types'
import { MOCK_STUDENTS } from '@/lib/mock-data'

const USE_MOCK = process.env.USE_MOCK === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function getStudents(): Promise<Student[]> {
  if (USE_MOCK) return MOCK_STUDENTS

  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('classroom')
    .order('fullname')

  if (error) throw error
  return data as Student[]
}

export async function getStudentById(id: string): Promise<Student | null> {
  if (USE_MOCK) return MOCK_STUDENTS.find(s => s.id === id) ?? null

  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Student
}

export async function createStudent(payload: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('students')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Student
}

export async function updateStudent(id: string, payload: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Student
}

export async function deleteStudent(id: string): Promise<void> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm run test:run -- src/test/services.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/services/attendance.ts src/services/students.ts src/test/services.test.ts
git commit -m "feat: add attendance and student services with mock data support"
```

---

## Task 7: Hooks

**Files:**
- Create: `src/hooks/useAttendance.ts`
- Create: `src/hooks/useStudents.ts`

- [ ] **Step 1: Create `src/hooks/useAttendance.ts`**

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/services/supabase'
import { getAttendanceByDate, getTodayStats } from '@/services/attendance'
import type { AttendanceLog, DashboardStats } from '@/types'

export function useAttendance(date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0]
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [logsData, statsData] = await Promise.all([
        getAttendanceByDate(today),
        getTodayStats(),
      ])
      setLogs(logsData)
      setStats(statsData)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    load()

    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') return

    const supabase = createBrowserClient()
    const channel = supabase
      .channel('attendance_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' },
        () => load()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { logs, stats, loading, refresh: load }
}
```

- [ ] **Step 2: Create `src/hooks/useStudents.ts`**

```typescript
'use client'
import { useEffect, useState, useMemo } from 'react'
import { getStudents } from '@/services/students'
import type { Student } from '@/types'

export function useStudents(classroomFilter?: string) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStudents().then(data => {
      setStudents(data)
      setLoading(false)
    })
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
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAttendance.ts src/hooks/useStudents.ts
git commit -m "feat: add useAttendance and useStudents hooks with realtime support"
```

---

## Task 8: Auth — Middleware & Login Page

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isMock = process.env.USE_MOCK === 'true'

  if (!isMock && !user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Create Login page — invoke ui-ux-pro-max skill**

> **NOTE:** Invoke `ui-ux-pro-max` skill with the following prompt to generate this page:
>
> "Create a login page for a Thai school attendance system. Style: Modern SaaS, dark/light mode, professional. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui. Content: Logo/title 'ระบบลงเวลานักเรียน', email + password fields, login button, Thai language. Action: Supabase email/password auth using createBrowserClient(). On success: redirect to '/'. On error: show toast. File: src/app/(auth)/login/page.tsx"

Expected output: `src/app/(auth)/login/page.tsx` with Supabase auth and Thai UI.

- [ ] **Step 3: Verify login page renders**

```bash
npm run dev
```

Open http://localhost:3000/login — should show Thai login form.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/
git commit -m "feat: add auth middleware and Thai login page"
```

---

## Task 9: Root Layout + Theme

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/providers/ThemeProvider.tsx`

- [ ] **Step 1: Install next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Create `src/components/providers/ThemeProvider.tsx`**

```typescript
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 3: Update `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'ระบบลงเวลานักเรียน',
  description: 'ระบบลงเวลาเข้าเรียนและรับส่งนักเรียน',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/providers/
git commit -m "feat: add root layout with Thai font (Sarabun), theme provider, and toaster"
```

---

## Task 10: Dashboard Layout (Sidebar, Header, MobileNav)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Invoke ui-ux-pro-max for layout components**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create dashboard layout components for a Thai school attendance system. Modern SaaS style, dark/light mode, responsive. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui.
>
> Sidebar.tsx: Logo 'ระบบลงเวลา', nav links (Dashboard/หน้าหลัก, Attendance/ลงเวลา, Students/นักเรียน, Classrooms/ห้องเรียน, Reports/รายงาน), icons from lucide-react, highlight active route, collapse on mobile.
>
> Header.tsx: Page title, dark/light toggle button (next-themes), user avatar with dropdown (logout via Supabase signOut).
>
> MobileNav.tsx: Bottom tab bar for mobile with 5 tabs matching Sidebar links.
>
> app/(dashboard)/layout.tsx: Protected layout combining Sidebar + Header + MobileNav, children in main content area."

- [ ] **Step 2: Verify layout renders**

```bash
npm run dev
```

Open http://localhost:3000 — should show sidebar layout with Thai navigation.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/ src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout with Sidebar, Header, MobileNav"
```

---

## Task 11: Dashboard Page

**Files:**
- Create: `src/components/dashboard/StatsCards.tsx`
- Create: `src/components/dashboard/AttendanceChart.tsx`
- Create: `src/components/dashboard/RecentActivity.tsx`
- Create: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Invoke ui-ux-pro-max for dashboard components**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create dashboard page components for a Thai school attendance system. Modern SaaS style. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui, recharts.
>
> StatsCards.tsx: 4 cards — ทั้งหมด (total, blue), มาเรียน (present, green), ขาดเรียน (absent, red), มาสาย (late, yellow). Props: DashboardStats type from @/types. Show count and percentage.
>
> AttendanceChart.tsx: BarChart (recharts) showing attendance by day for last 7 days. Mock data if no real data. Thai day labels.
>
> RecentActivity.tsx: List of last 10 attendance_logs with student name, status badge, time, check_type in Thai. Real-time via useAttendance hook.
>
> app/(dashboard)/page.tsx: Compose all three components. Use useAttendance() hook. Show date in Thai format."

- [ ] **Step 2: Write component test**

Create `src/test/StatsCards.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsCards } from '@/components/dashboard/StatsCards'

describe('StatsCards', () => {
  it('renders all 4 stat cards', () => {
    render(<StatsCards stats={{ total: 20, present: 15, absent: 3, late: 2, date: '2026-05-28' }} />)
    expect(screen.getByText('20')).toBeTruthy()
    expect(screen.getByText('15')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run test**

```bash
npm run test:run -- src/test/StatsCards.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ src/app/\(dashboard\)/page.tsx src/test/StatsCards.test.tsx
git commit -m "feat: add dashboard page with stats cards, chart, and realtime activity"
```

---

## Task 12: Attendance Page + CameraModal

**Files:**
- Create: `src/components/attendance/StatusBadge.tsx`
- Create: `src/components/attendance/CheckInButton.tsx`
- Create: `src/components/attendance/AttendanceTable.tsx`
- Create: `src/components/attendance/CameraModal.tsx`
- Create: `src/app/(dashboard)/attendance/page.tsx`

- [ ] **Step 1: Create `src/components/attendance/StatusBadge.tsx`**

```typescript
import { Badge } from '@/components/ui/badge'
import type { AttendanceStatus } from '@/types'

const config: Record<AttendanceStatus, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  present: { label: 'มาเรียน', variant: 'default' },
  absent: { label: 'ขาดเรียน', variant: 'destructive' },
  late: { label: 'มาสาย', variant: 'secondary' },
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 2: Write StatusBadge test**

Create `src/test/StatusBadge.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/attendance/StatusBadge'

describe('StatusBadge', () => {
  it('shows มาเรียน for present', () => {
    render(<StatusBadge status="present" />)
    expect(screen.getByText('มาเรียน')).toBeTruthy()
  })
  it('shows ขาดเรียน for absent', () => {
    render(<StatusBadge status="absent" />)
    expect(screen.getByText('ขาดเรียน')).toBeTruthy()
  })
  it('shows มาสาย for late', () => {
    render(<StatusBadge status="late" />)
    expect(screen.getByText('มาสาย')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run StatusBadge test**

```bash
npm run test:run -- src/test/StatusBadge.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Invoke ui-ux-pro-max for remaining attendance components**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create attendance components for a Thai school attendance system. Tablet-first, large buttons, Modern SaaS. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui.
>
> CheckInButton.tsx: Large button (min h-16, text-lg) for check_in/check_out/pickup. Props: checkType (CheckType), studentName (string), onPress (()=>void), loading (boolean). Thai labels: เช็คชื่อเข้า/เช็คชื่อออก/รับกลับ. Show spinner when loading.
>
> AttendanceTable.tsx: Table of students with columns: รหัส, ชื่อ-นามสกุล, ห้อง, สถานะ (StatusBadge), เวลา, ปุ่มลงเวลา (CheckInButton). Props: students (Student[]), logs (AttendanceLog[]), onCheckIn ((studentId, checkType) => void). Search + classroom filter at top.
>
> CameraModal.tsx: Dialog modal. Opens device camera via getUserMedia (environment facing). Shows live video preview. Capture button takes photo (canvas). Shows captured image for confirmation. Confirm button calls onCapture(blob). Cancel closes modal. Shows toast error if camera permission denied. Props: open (boolean), onClose (()=>void), onCapture ((blob: Blob) => void), studentName (string).
>
> app/(dashboard)/attendance/page.tsx: Main attendance page. Uses useAttendance + useStudents. Classroom selector tabs at top. AttendanceTable below. On row check-in: open CameraModal → capture → POST /api/upload-drive → createAttendanceLog → refresh. Show loading states and toasts."

- [ ] **Step 5: Verify attendance page renders**

```bash
npm run dev
```

Open http://localhost:3000/attendance — verify table shows mock students, camera modal opens on check-in button click.

- [ ] **Step 6: Commit**

```bash
git add src/components/attendance/ src/app/\(dashboard\)/attendance/ src/test/StatusBadge.test.tsx
git commit -m "feat: add attendance page with table, camera modal, and check-in flow"
```

---

## Task 13: API Routes — Google Drive & Telegram

**Files:**
- Create: `src/services/drive.ts`
- Create: `src/services/telegram.ts`
- Create: `src/app/api/upload-drive/route.ts`
- Create: `src/app/api/notify/route.ts`

- [ ] **Step 1: Create `src/services/drive.ts`**

```typescript
import { google } from 'googleapis'
import sharp from 'sharp'
import { Readable } from 'stream'

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
  return google.drive({ version: 'v3', auth })
}

export async function uploadImageToDrive(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  const resized = await sharp(imageBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const drive = getDriveClient()
  const stream = Readable.from(resized)

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: { mimeType: 'image/jpeg', body: stream },
    fields: 'id, webViewLink',
  })

  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  return `https://drive.google.com/uc?id=${res.data.id}`
}
```

- [ ] **Step 2: Create `src/services/telegram.ts`**

```typescript
export async function sendTelegramNotification(payload: {
  chatId: string
  message: string
  imageUrl?: string
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  const baseUrl = `https://api.telegram.org/bot${token}`

  if (payload.imageUrl) {
    await fetch(`${baseUrl}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: payload.chatId,
        photo: payload.imageUrl,
        caption: payload.message,
        parse_mode: 'HTML',
      }),
    })
  } else {
    await fetch(`${baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: payload.chatId,
        text: payload.message,
        parse_mode: 'HTML',
      }),
    })
  }
}
```

- [ ] **Step 3: Create `src/app/api/upload-drive/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToDrive } from '@/services/drive'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `attendance_${Date.now()}.jpg`
    const url = await uploadImageToDrive(buffer, filename)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Drive upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create `src/app/api/notify/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/services/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, studentName, checkType, time, imageUrl } = body

    if (!chatId || !studentName) {
      return NextResponse.json({ error: 'chatId and studentName required' }, { status: 400 })
    }

    const checkTypeLabel = checkType === 'check_in' ? 'เข้าเรียน' : checkType === 'check_out' ? 'ออกจากโรงเรียน' : 'ถูกรับกลับบ้าน'
    const message = `📢 <b>${studentName}</b>\n${checkTypeLabel} เวลา ${time}`

    await sendTelegramNotification({ chatId, message, imageUrl })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram notify error:', error)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Write API route test**

Create `src/test/api-upload.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/drive', () => ({
  uploadImageToDrive: vi.fn().mockResolvedValue('https://drive.google.com/uc?id=test123'),
}))

describe('upload-drive route validation', () => {
  it('uploadImageToDrive returns a URL string', async () => {
    const { uploadImageToDrive } = await import('@/services/drive')
    const result = await uploadImageToDrive(Buffer.from('test'), 'test.jpg')
    expect(result).toMatch(/^https:\/\/drive\.google\.com/)
  })
})
```

- [ ] **Step 6: Run test**

```bash
npm run test:run -- src/test/api-upload.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/services/drive.ts src/services/telegram.ts src/app/api/ src/test/api-upload.test.ts
git commit -m "feat: add Google Drive upload and Telegram notification API routes"
```

---

## Task 14: Students Page (CRUD)

**Files:**
- Create: `src/components/students/StudentCard.tsx`
- Create: `src/components/students/StudentForm.tsx`
- Create: `src/app/(dashboard)/students/page.tsx`
- Create: `src/app/(dashboard)/students/[id]/page.tsx`

- [ ] **Step 1: Invoke ui-ux-pro-max**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create student management pages for a Thai school attendance system. Modern SaaS style. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui.
>
> StudentCard.tsx: Card showing student avatar (initials fallback), name, student_code, classroom badge, parent info. Props: student (Student), onEdit (()=>void), onDelete (()=>void).
>
> StudentForm.tsx: Dialog form for Add/Edit student. Fields: student_code, fullname, classroom (Select with ป.1/1, ป.1/2, ป.2/1 options), parent_name, parent_phone. Validate all fields required. Props: open, onClose, onSubmit((data)=>void), initialData (Student | null).
>
> students/page.tsx: Grid of StudentCards. Search bar + classroom filter. Add Student button opens StudentForm. Edit/Delete from card. Uses useStudents hook. Calls createStudent/updateStudent/deleteStudent from @/services/students. Show confirmation dialog before delete. Toast on success/error.
>
> students/[id]/page.tsx: Student detail page. Shows student info + attendance history (last 30 days). Attendance shown as calendar heatmap or simple list. Uses getAttendanceByDate filtered by student_id."

- [ ] **Step 2: Verify students page**

```bash
npm run dev
```

Open http://localhost:3000/students — should show 20 mock students in grid.

- [ ] **Step 3: Commit**

```bash
git add src/components/students/ src/app/\(dashboard\)/students/
git commit -m "feat: add students CRUD page with search, filter, and attendance history"
```

---

## Task 15: Classrooms Page

**Files:**
- Create: `src/app/(dashboard)/classrooms/page.tsx`

- [ ] **Step 1: Invoke ui-ux-pro-max**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create a classrooms management page for a Thai school attendance system. Modern SaaS style. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui.
>
> classrooms/page.tsx: 3 classroom cards (ป.1/1, ป.1/2, ป.2/1). Each card shows: classroom name, student count, today's attendance rate (present/total), mini bar chart. Clicking a card filters to that classroom's students. Uses useStudents and useAttendance hooks. Add Classroom button (stores in Supabase when not in mock mode)."

- [ ] **Step 2: Verify classrooms page**

```bash
npm run dev
```

Open http://localhost:3000/classrooms — should show 3 classroom cards with stats.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/classrooms/
git commit -m "feat: add classrooms page with attendance stats per classroom"
```

---

## Task 16: Reports Page

**Files:**
- Create: `src/app/(dashboard)/reports/page.tsx`

- [ ] **Step 1: Invoke ui-ux-pro-max**

> **NOTE:** Invoke `ui-ux-pro-max` skill with this prompt:
>
> "Create a reports page for a Thai school attendance system. Modern SaaS style. Stack: Next.js 15, TypeScript, TailwindCSS, shadcn/ui, recharts.
>
> reports/page.tsx:
> - Date range selector (today / this week / this month / custom)
> - Tabs: รายวัน / รายสัปดาห์ / รายเดือน
> - BarChart: attendance rate per day for selected range (recharts)
> - LineChart: trend over time
> - Table: student-by-student attendance summary (name, present days, absent days, late days, rate%)
> - Classroom filter dropdown
> Uses mock data from MOCK_ATTENDANCE_LOGS when USE_MOCK=true"

- [ ] **Step 2: Verify reports page**

```bash
npm run dev
```

Open http://localhost:3000/reports — should show charts and table with mock data.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/reports/
git commit -m "feat: add reports page with charts and attendance summary table"
```

---

## Task 17: Final Integration & Verification

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests PASS.

- [ ] **Step 2: Run dev server and verify all pages**

```bash
npm run dev
```

Checklist:
- [ ] `/login` — Thai login form renders
- [ ] `/` — Dashboard with stats cards and chart
- [ ] `/attendance` — Student table + camera modal opens
- [ ] `/students` — 20 students in grid, search works
- [ ] `/classrooms` — 3 classroom cards
- [ ] `/reports` — Charts and table render
- [ ] Dark mode toggle works
- [ ] Mobile/tablet responsive (DevTools → iPhone 12 Pro)
- [ ] Sidebar navigation highlights active route

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete MVP student attendance system"
```

---

## Environment Variables Reference

```env
# .env.local (dev)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=
TELEGRAM_BOT_TOKEN=
USE_MOCK=true
NEXT_PUBLIC_USE_MOCK=true

# Vercel env vars (production) — same keys, USE_MOCK=false
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Next.js 15 + TypeScript + TailwindCSS + shadcn/ui | Task 1 |
| Supabase Auth + RLS | Tasks 3, 4, 8 |
| Google Drive image upload (server-side) | Task 13 |
| Telegram notification (server-side) | Task 13 |
| Teacher login | Task 8 |
| Student management CRUD | Task 14 |
| Attendance check-in/out + photo | Task 12 |
| Camera modal | Task 12 |
| Dashboard with stats + chart | Task 11 |
| Realtime updates | Tasks 7, 11 |
| Classroom management | Task 15 |
| Reports (daily/weekly/monthly) | Task 16 |
| Mock data for dev | Task 5 |
| Responsive + tablet-friendly | Tasks 9, 10 |
| Dark/light mode | Task 9 |
| Security (no credentials client-side) | Tasks 8, 13 |
