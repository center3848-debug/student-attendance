# Student Attendance & Pickup System — Design Spec
Date: 2026-05-28

## Overview

ระบบลงเวลาเข้าเรียนและรับส่งนักเรียน สำหรับครูใช้งานบนมือถือ/Tablet
ครูเลือกนักเรียน → ถ่ายรูปหลักฐาน → บันทึก Supabase → แจ้ง Telegram ผู้ปกครอง

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, RLS) |
| Storage | Google Drive API (เก็บเฉพาะ URL ใน DB) |
| Notification | Telegram Bot API |
| Hosting | Vercel |
| AI (future) | face-api.js |

---

## Architecture

**Approach: All-in-One Next.js 15**
- API Routes ทำหน้าที่ BFF: จัดการ Google Drive upload และ Telegram (server-side, credentials ปลอดภัย)
- Supabase client SDK สำหรับ real-time subscriptions และ auth
- Deploy Vercel เดียวจบ

---

## Pages & Routes

```
src/app/
├── (auth)/
│   └── login/            → Login ครู (Supabase Auth)
├── (dashboard)/
│   ├── layout.tsx        → Sidebar + Header (protected)
│   ├── page.tsx          → Dashboard หลัก (สถิติวันนี้)
│   ├── attendance/
│   │   └── page.tsx      → ลงเวลาเข้า-ออก + ถ่ายรูป
│   ├── students/
│   │   ├── page.tsx      → รายชื่อนักเรียนทั้งหมด
│   │   └── [id]/         → รายละเอียด + ประวัติการมา
│   ├── classrooms/
│   │   └── page.tsx      → จัดการห้องเรียน
│   └── reports/
│       └── page.tsx      → รายงานรายวัน/สัปดาห์/เดือน
├── api/
│   ├── upload-drive/     → upload รูปไป Google Drive (server-only)
│   └── notify/           → ส่ง Telegram notification (server-only)
└── middleware.ts          → Guard routes ด้วย Supabase session
```

---

## Components

```
src/components/
├── ui/                        → shadcn/ui base components
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── MobileNav.tsx
├── attendance/
│   ├── AttendanceTable.tsx    → ตารางรายชื่อ + Badge สถานะ
│   ├── CameraModal.tsx        → Modal เปิดกล้อง + ถ่ายรูป
│   ├── CheckInButton.tsx      → ปุ่มใหญ่ Tablet-friendly
│   └── StatusBadge.tsx        → มา/ขาด/สาย/รับกลับ
├── dashboard/
│   ├── StatsCards.tsx         → Card สรุปสถิติวันนี้
│   ├── AttendanceChart.tsx    → กราฟ recharts
│   └── RecentActivity.tsx     → Realtime activity feed
└── students/
    ├── StudentCard.tsx
    └── StudentForm.tsx        → Add/Edit modal
```

---

## Services

```
src/services/
├── supabase.ts     → Supabase client + typed helpers
├── attendance.ts   → CRUD attendance_logs
├── students.ts     → CRUD students
├── drive.ts        → Google Drive upload (server-only)
└── telegram.ts     → Bot notification (server-only)

src/hooks/
├── useAttendance.ts  → Realtime subscription attendance_logs
└── useStudents.ts    → Student list + filters

src/types/
└── index.ts          → Student, AttendanceLog, User interfaces
```

---

## Database Schema

### students
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_code | text | รหัสนักเรียน |
| fullname | text | ชื่อ-นามสกุล |
| classroom | text | ห้องเรียน |
| parent_name | text | ชื่อผู้ปกครอง |
| parent_phone | text | เบอร์ผู้ปกครอง |
| profile_image_url | text | URL รูปโปรไฟล์ |
| created_at | timestamptz | |

### attendance_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| student_id | uuid | FK → students.id |
| check_type | enum | check_in / check_out / pickup |
| image_url | text | URL รูปหลักฐาน (Google Drive) |
| timestamp | timestamptz | เวลาบันทึก |
| device_name | text | ชื่ออุปกรณ์ที่ใช้ |
| status | enum | present / absent / late |

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK (Supabase Auth) |
| fullname | text | |
| email | text | |
| role | enum | teacher / admin |
| school_id | uuid | รองรับหลายโรงเรียน |
| created_at | timestamptz | |

---

## Data Flow

```
1. ครูเปิด Web App → middleware ตรวจ session → redirect login ถ้าไม่มี
2. เลือกนักเรียน + check_type (เข้า/ออก/รับกลับ)
3. กดปุ่ม → CameraModal เปิด getUserMedia
4. ถ่ายรูป → POST /api/upload-drive
   - Validate: image/* เท่านั้น, < 5MB
   - Resize เป็น 800px ด้วย sharp
   - Upload Google Drive → ได้ image_url
5. INSERT attendance_logs (Supabase)
   - Realtime subscription อัปเดต Dashboard อัตโนมัติ
6. POST /api/notify → Telegram ส่งข้อความ + รูปหา parent
7. Toast แสดงผลสำเร็จ
```

---

## Error Handling

| Scenario | การจัดการ |
|---|---|
| ปฏิเสธกล้อง | Toast "กรุณาอนุญาตใช้กล้อง" |
| Upload ล้มเหลว | Retry 1 ครั้ง → toast error |
| Supabase network error | Optimistic UI + queue retry |
| Telegram ล้มเหลว | ไม่ block flow หลัก, log error เงียบๆ |

---

## Security

- Google Drive service account credentials: `.env` server-side เท่านั้น
- Telegram Bot token: server-side เท่านั้น
- Supabase RLS: เปิดทุก table
- `middleware.ts`: redirect ถ้าไม่มี session
- ไม่ expose credentials ฝั่ง client เด็ดขาด

---

## Mock Data (dev)

- `src/lib/mock-data.ts` — นักเรียนตัวอย่าง 20 คน, 3 ห้อง
- Feature flag: `USE_MOCK=true` ใน `.env.local`

---

## Design Style

- Modern SaaS, Minimal, Professional
- Dark mode + Light mode
- ปุ่มขนาดใหญ่สำหรับ Tablet
- Responsive รองรับมือถือและ Tablet
- ภาษาไทยทุกหน้า

---

## Out of Scope (MVP)

- Face recognition (face-api.js) — Phase อนาคต
- Export Excel/PDF — Phase 2
- Multi-school admin panel — Phase 2
