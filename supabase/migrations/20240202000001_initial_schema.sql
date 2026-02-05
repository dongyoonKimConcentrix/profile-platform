-- pgvector 확장 활성화
create extension if not exists vector;

-- 관리자 사용자 테이블
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인력 프로필 테이블
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  position text not null check (position in ('frontend', 'backend', 'fullstack', 'mobile', 'data', 'devops')),
  experience text not null check (experience in ('junior', 'mid', 'senior', 'expert')),
  domain text check (domain in ('finance', 'ecommerce', 'healthcare', 'education', 'manufacturing', 'logistics')),
  skills text[] default '{}',
  description text,
  match_score integer default 0,
  -- pgvector를 위한 임베딩 컬럼 (AI 검색용)
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인력 역량 테이블
create table if not exists public.profile_capabilities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  markup_precision integer default 0 check (markup_precision >= 0 and markup_precision <= 100),
  js_ts_logic integer default 0 check (js_ts_logic >= 0 and js_ts_logic <= 100),
  framework_proficiency integer default 0 check (framework_proficiency >= 0 and framework_proficiency <= 100),
  ui_ux_design integer default 0 check (ui_ux_design >= 0 and ui_ux_design <= 100),
  web_optimization integer default 0 check (web_optimization >= 0 and web_optimization <= 100),
  accessibility integer default 0 check (accessibility >= 0 and accessibility <= 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id)
);

-- 인력 프로젝트 이력 테이블
create table if not exists public.profile_projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  industry text not null,
  project_name text not null,
  duration text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인덱스 생성 (006에서 position/experience/domain 제거 후 재실행 시 컬럼 없으면 스킵)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'position') then
    create index if not exists profiles_position_idx on public.profiles(position);
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'experience') then
    create index if not exists profiles_experience_idx on public.profiles(experience);
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'domain') then
    create index if not exists profiles_domain_idx on public.profiles(domain);
  end if;
end $$;
create index if not exists profiles_skills_idx on public.profiles using gin(skills);
create index if not exists profiles_embedding_idx on public.profiles using hnsw (embedding vector_cosine_ops);

-- 업데이트 시간 자동 갱신 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 트리거 생성
create trigger update_admin_users_updated_at before update on public.admin_users
  for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_profile_capabilities_updated_at before update on public.profile_capabilities
  for each row execute function update_updated_at_column();

create trigger update_profile_projects_updated_at before update on public.profile_projects
  for each row execute function update_updated_at_column();
