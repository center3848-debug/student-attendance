create extension if not exists "uuid-ossp";

create type check_type as enum ('check_in', 'check_out', 'pickup');
create type attendance_status as enum ('present', 'absent', 'late');
create type user_role as enum ('teacher', 'admin');

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  fullname text not null,
  email text not null,
  role user_role not null default 'teacher',
  school_id uuid,
  created_at timestamptz not null default now()
);

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

create table public.attendance_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  check_type check_type not null,
  image_url text,
  timestamp timestamptz not null default now(),
  device_name text not null default '',
  status attendance_status not null default 'present'
);

create index attendance_logs_student_id_idx on public.attendance_logs(student_id);
create index attendance_logs_timestamp_idx on public.attendance_logs(timestamp desc);

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.attendance_logs enable row level security;

create policy "authenticated read students" on public.students for select to authenticated using (true);
create policy "authenticated write students" on public.students for all to authenticated using (true) with check (true);
create policy "authenticated read attendance" on public.attendance_logs for select to authenticated using (true);
create policy "authenticated write attendance" on public.attendance_logs for all to authenticated using (true) with check (true);
create policy "users read own" on public.users for select to authenticated using (auth.uid() = id);

alter publication supabase_realtime add table public.attendance_logs;
