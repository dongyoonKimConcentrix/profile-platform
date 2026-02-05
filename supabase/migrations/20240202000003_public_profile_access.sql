-- 공개 프로필 조회 정책 추가
-- 모든 사용자(인증되지 않은 사용자 포함)가 프로필을 조회할 수 있도록 허용

-- profiles 테이블에 대한 공개 조회 정책
create policy "Public can view profiles"
  on public.profiles
  for select
  using (true);

-- profile_capabilities 테이블에 대한 공개 조회 정책
create policy "Public can view capabilities"
  on public.profile_capabilities
  for select
  using (true);

-- profile_projects 테이블에 대한 공개 조회 정책
create policy "Public can view projects"
  on public.profile_projects
  for select
  using (true);
