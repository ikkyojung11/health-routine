-- ==========================================================
-- 헬스루틴 (Health Routine) Supabase Schema
-- ==========================================================

-- 1. 기구 및 운동 목록 테이블 (부위별 기본 기구 및 커스텀 기구)
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  category text not null check (category in ('가슴', '등', '하체', '팔', '어깨', '복근/코어', '유산소')),
  target_muscle text,
  tips text,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 운동 세션 테이블 (하루 운동 기록)
create table if not exists public.workout_sessions (
  id text primary key,
  date text not null, -- YYYY-MM-DD
  title text,
  duration_minutes integer default 0,
  notes text,
  total_volume numeric default 0,
  total_sets integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 세션 내 수행한 운동 기록 테이블
create table if not exists public.workout_logs (
  id text primary key,
  session_id text not null references public.workout_sessions(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  category text not null,
  order_index integer default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 세트별 상세 기록 테이블 (중량, 횟수, 완료 여부)
create table if not exists public.workout_sets (
  id text primary key,
  log_id text not null references public.workout_logs(id) on delete cascade,
  set_number integer not null,
  weight numeric not null default 0,
  reps integer not null default 0,
  completed boolean default false,
  rpe numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 활성화
alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_sets enable row level security;

-- 공용 읽기/쓰기 허용 정책 (개인 기기 및 익명 클라이언트 지원)
create policy "Allow all operations on exercises" on public.exercises for all using (true) with check (true);
create policy "Allow all operations on workout_sessions" on public.workout_sessions for all using (true) with check (true);
create policy "Allow all operations on workout_logs" on public.workout_logs for all using (true) with check (true);
create policy "Allow all operations on workout_sets" on public.workout_sets for all using (true) with check (true);

-- 인덱스 생성 (성장 추이 및 날짜별 쿼리 최적화)
create index if not exists idx_sessions_date on public.workout_sessions(date desc);
create index if not exists idx_logs_exercise_id on public.workout_logs(exercise_id);
create index if not exists idx_sets_log_id on public.workout_sets(log_id);
