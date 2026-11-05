-- Supabase Schema for Komit-V2
-- Matches AGENTS.md and PRD.md

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  buyer_name text not null,
  buyer_whatsapp text not null,
  service_type text not null default 'project_joki', -- 'project_joki', 'makalah', 'ppt', 'tugas_ringan'
  package_type text not null default 'full',         -- 'full', 'code_only', 'idea_only'
  member_count integer not null default 1,
  total_price integer not null default 50000,
  payment_proof_url text,
  payment_status text not null default 'pending',    -- 'pending', 'paid', 'rejected'
  niche_input text,
  generated_ideas jsonb,
  selected_idea jsonb,
  github_repo_url text,
  readme_content text,
  ppt_addon_paid boolean not null default false,
  ppt_proof_url text,
  ppt_file_url text,
  status text not null default 'waiting_payment'     -- 'waiting_payment', 'setup', 'in_progress', 'completed'
);

-- 2. Project Members Table
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  nim text not null,
  kom text not null,
  github_username text,
  github_email text,
  github_access_token text, -- Server-only token, NEVER expose to client
  is_connected boolean not null default false
);

-- Index for fast lookup by project_id
create index if not exists idx_project_members_project_id on public.project_members(project_id);

-- 3. Commit Schedules Table
create table if not exists public.commit_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.project_members(id) on delete cascade,
  commit_message text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled', -- 'scheduled', 'pushed', 'failed'
  commit_hash text
);

-- Index for scheduler queries
create index if not exists idx_commit_schedules_project_id on public.commit_schedules(project_id);
create index if not exists idx_commit_schedules_member_id on public.commit_schedules(member_id);
create index if not exists idx_commit_schedules_scheduled_at on public.commit_schedules(scheduled_at);

-- Row Level Security (RLS) policies
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.commit_schedules enable row level security;

-- Client access policies (allow public access by project id for MVP anonymous unique link flow)
create policy "Allow read project by id" on public.projects
  for select using (true);

create policy "Allow insert project for orders" on public.projects
  for insert with check (true);

create policy "Allow update project" on public.projects
  for update using (true);

-- Project Members: select without exposing github_access_token (views or column security recommended)
create policy "Allow read members" on public.project_members
  for select using (true);

create policy "Allow insert members" on public.project_members
  for insert with check (true);

create policy "Allow update members" on public.project_members
  for update using (true);

-- Commit Schedules
create policy "Allow read schedules" on public.commit_schedules
  for select using (true);

create policy "Allow manage schedules" on public.commit_schedules
  for all using (true);
