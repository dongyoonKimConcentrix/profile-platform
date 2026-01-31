-- 프로젝트 경력 테이블 (profile_projects는 재직이력·회사명만, 프로젝트 경력은 별도)
create table if not exists public.profile_project_careers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  project_name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profile_project_careers_profile_id_idx on public.profile_project_careers(profile_id);

alter table public.profile_project_careers enable row level security;

drop policy if exists "Public can view project careers" on public.profile_project_careers;
create policy "Public can view project careers"
  on public.profile_project_careers for select using (true);

drop policy if exists "Admins can manage project careers" on public.profile_project_careers;
create policy "Admins can manage project careers"
  on public.profile_project_careers for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop trigger if exists update_profile_project_careers_updated_at on public.profile_project_careers;
create trigger update_profile_project_careers_updated_at
  before update on public.profile_project_careers
  for each row execute function update_updated_at_column();
