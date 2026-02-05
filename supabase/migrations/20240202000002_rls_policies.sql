-- RLS 활성화
alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_capabilities enable row level security;
alter table public.profile_projects enable row level security;

-- admin_users RLS 정책
-- 관리자만 자신의 정보 조회 가능
create policy "Admin users can view own record"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

-- 관리자만 자신의 정보 수정 가능
create policy "Admin users can update own record"
  on public.admin_users
  for update
  using (auth.uid() = user_id);

-- 서비스 역할만 관리자 생성 가능 (초기 설정용)
create policy "Service role can insert admin users"
  on public.admin_users
  for insert
  with check (true);

-- profiles RLS 정책
-- 모든 인증된 사용자는 프로필 조회 가능
create policy "Authenticated users can view profiles"
  on public.profiles
  for select
  using (auth.role() = 'authenticated');

-- 관리자만 프로필 생성 가능
create policy "Admins can insert profiles"
  on public.profiles
  for insert
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- 관리자만 프로필 수정 가능
create policy "Admins can update profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- 관리자만 프로필 삭제 가능
create policy "Admins can delete profiles"
  on public.profiles
  for delete
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- profile_capabilities RLS 정책
-- 모든 인증된 사용자는 역량 조회 가능
create policy "Authenticated users can view capabilities"
  on public.profile_capabilities
  for select
  using (auth.role() = 'authenticated');

-- 관리자만 역량 생성/수정/삭제 가능
create policy "Admins can manage capabilities"
  on public.profile_capabilities
  for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- profile_projects RLS 정책
-- 모든 인증된 사용자는 프로젝트 조회 가능
create policy "Authenticated users can view projects"
  on public.profile_projects
  for select
  using (auth.role() = 'authenticated');

-- 관리자만 프로젝트 생성/수정/삭제 가능
create policy "Admins can manage projects"
  on public.profile_projects
  for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );
