-- =====================================================================
-- ระบบลงเวลานักเรียน — Supabase schema (รันบน SQL Editor ของโปรเจกต์ใหม่)
-- ครบทุกตาราง: users, students, attendance_logs, classrooms, lunch_inspections
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ----- enums -----
do $$ begin
  create type check_type as enum ('check_in', 'check_out', 'pickup');
exception when duplicate_object then null; end $$;
do $$ begin
  create type attendance_status as enum ('present', 'absent', 'late');
exception when duplicate_object then null; end $$;
do $$ begin
  create type user_role as enum ('teacher', 'admin');
exception when duplicate_object then null; end $$;

-- ----- ผู้ใช้ระบบ (ครู/แอดมิน) -----
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  fullname text not null,
  email text not null,
  role user_role not null default 'teacher',
  school_id uuid,
  created_at timestamptz not null default now()
);

-- ----- นักเรียน -----
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  student_code text not null unique,
  fullname text not null,
  classroom text not null,
  parent_name text not null default '',
  parent_phone text not null default '',
  profile_image_url text,
  created_at timestamptz not null default now()
);

-- ----- บันทึกการลงเวลา -----
create table if not exists public.attendance_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  check_type check_type not null,
  image_url text,
  timestamp timestamptz not null default now(),
  device_name text not null default '',
  status attendance_status not null default 'present'
);
create index if not exists attendance_logs_student_id_idx on public.attendance_logs(student_id);
create index if not exists attendance_logs_timestamp_idx on public.attendance_logs(timestamp desc);

-- ----- ห้องเรียน (แบบไดนามิก) -----
create table if not exists public.classrooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- ----- แบบตรวจอาหารกลางวัน -----
create table if not exists public.lunch_inspections (
  id uuid primary key default gen_random_uuid(),
  inspect_date date not null default current_date,
  food_menu text not null default '',
  dessert_menu text not null default '',
  items jsonb not null default '{}'::jsonb,
  suggestion text not null default '',
  recorder1 text not null default '',
  recorder2 text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- ----- RLS -----
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.classrooms enable row level security;
alter table public.lunch_inspections enable row level security;

create policy "users read own" on public.users for select to authenticated using (auth.uid() = id);

create policy "authenticated read students" on public.students for select to authenticated using (true);
create policy "authenticated write students" on public.students for all to authenticated using (true) with check (true);

create policy "authenticated read attendance" on public.attendance_logs for select to authenticated using (true);
create policy "authenticated write attendance" on public.attendance_logs for all to authenticated using (true) with check (true);

create policy "auth read classrooms" on public.classrooms for select to authenticated using (true);
create policy "auth write classrooms" on public.classrooms for all to authenticated using (true) with check (true);

create policy "auth read lunch" on public.lunch_inspections for select to authenticated using (true);
create policy "auth write lunch" on public.lunch_inspections for all to authenticated using (true) with check (true);

-- ----- realtime (อัปเดตหน้าลงเวลาสด) -----
alter publication supabase_realtime add table public.attendance_logs;

-- ----- seed ห้องเรียนเริ่มต้น (แก้/ลบได้ภายหลังในหน้าห้องเรียน) -----
insert into public.classrooms (name) values ('ห้อง 1'), ('ห้อง 2'), ('ห้อง 3')
on conflict (name) do nothing;
