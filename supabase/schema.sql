-- ============================================
-- Lazos App - Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Projects (Έργα)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  price_per_meter numeric not null default 0,
  price_metra numeric default 0,
  sinazi text default '',
  sinazi_metro numeric default 0,
  gonies text default '',
  gonies_metro numeric default 0,
  owed numeric not null default 0,
  advance numeric not null default 0,
  project_expenses numeric not null default 0,
  vat_percent numeric default null,
  start_date date default null,
  completion_date date default null,
  created_at timestamptz not null default now()
);

-- 1b. Project income (Έσοδα ανά έργο: ποσό + προαιρετικό ΦΠΑ %)
create table if not exists public.project_income (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  amount numeric not null default 0,
  vat_percent numeric default null,
  payment_date date default null
);

-- 1c. Project other works (Άλλες εργασίες ανά έργο: όνομα + τιμή)
create table if not exists public.project_other_works (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  price numeric not null default 0
);

-- 2. Income (Έσοδα)
create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric not null default 0,
  description text default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 3. Expenses (Έξοδα)
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric not null default 0,
  description text default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
alter table public.projects enable row level security;
alter table public.income enable row level security;
alter table public.expenses enable row level security;

-- Projects policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Project other works policies (access via project ownership)
alter table public.project_other_works enable row level security;

create policy "Users can view own project other works"
  on public.project_other_works for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_other_works.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own project other works"
  on public.project_other_works for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_other_works.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own project other works"
  on public.project_other_works for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_other_works.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own project other works"
  on public.project_other_works for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_other_works.project_id and projects.user_id = auth.uid()
    )
  );

-- Project income policies (access via project ownership)
alter table public.project_income enable row level security;

create policy "Users can view own project income"
  on public.project_income for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_income.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own project income"
  on public.project_income for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_income.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own project income"
  on public.project_income for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_income.project_id and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own project income"
  on public.project_income for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_income.project_id and projects.user_id = auth.uid()
    )
  );

-- Income policies
create policy "Users can view own income"
  on public.income for select
  using (auth.uid() = user_id);

create policy "Users can insert own income"
  on public.income for insert
  with check (auth.uid() = user_id);

create policy "Users can update own income"
  on public.income for update
  using (auth.uid() = user_id);

create policy "Users can delete own income"
  on public.income for delete
  using (auth.uid() = user_id);

-- Expenses policies
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_project_other_works_project_id on public.project_other_works(project_id);
create index if not exists idx_project_income_project_id on public.project_income(project_id);
create index if not exists idx_income_user_id on public.income(user_id);
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_income_project_id on public.income(project_id);
create index if not exists idx_expenses_project_id on public.expenses(project_id);
