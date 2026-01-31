-- 프로필 스키마 변경: 새 항목 적용
-- name -> name_ko, name_en / position, experience, domain, description 제거
-- job_grade, team, education, position_role, industry_experience, career_description 추가

-- 1. 새 컬럼 추가 (nullable)
alter table public.profiles add column if not exists name_ko text;
alter table public.profiles add column if not exists name_en text;
alter table public.profiles add column if not exists job_grade text;
alter table public.profiles add column if not exists team text;
alter table public.profiles add column if not exists education text;
alter table public.profiles add column if not exists position_role text;
alter table public.profiles add column if not exists industry_experience text[] default '{}';
alter table public.profiles add column if not exists career_description text;

-- 2. 기존 데이터 이전 (name -> name_ko, description -> career_description, domain -> industry_experience)
update public.profiles set name_ko = name where name_ko is null and name is not null;
update public.profiles set career_description = description where career_description is null and description is not null;
update public.profiles set industry_experience = domain where industry_experience is null or industry_experience = '{}';

-- 3. 기존 컬럼 제거 (제약/인덱스 먼저 제거)
alter table public.profiles drop constraint if exists profiles_position_check;
alter table public.profiles drop constraint if exists profiles_experience_check;
alter table public.profiles drop constraint if exists profiles_domain_check;
drop index if exists profiles_position_idx;
drop index if exists profiles_experience_idx;
drop index if exists profiles_domain_idx;

alter table public.profiles drop column if exists name;
alter table public.profiles drop column if exists position;
alter table public.profiles drop column if exists experience;
alter table public.profiles drop column if exists domain;
alter table public.profiles drop column if exists description;

-- 4. 새 컬럼 NOT NULL 및 제약
alter table public.profiles alter column name_ko set not null;
alter table public.profiles alter column name_ko set default '';

alter table public.profiles add constraint profiles_job_grade_check
  check (job_grade is null or job_grade in ('사원','대리','과장','차장','부장','실장','이사'));

alter table public.profiles add constraint profiles_education_check
  check (education is null or education in ('고졸','전문학사','학사','석사','박사'));

alter table public.profiles add constraint profiles_position_role_check
  check (position_role is null or position_role in ('기획자','디자이너','퍼블리셔','프론트엔드개발자','백엔드개발자'));

-- 5. 인덱스
create index if not exists profiles_job_grade_idx on public.profiles(job_grade);
create index if not exists profiles_education_idx on public.profiles(education);
create index if not exists profiles_position_role_idx on public.profiles(position_role);
create index if not exists profiles_industry_experience_idx on public.profiles using gin(industry_experience);
