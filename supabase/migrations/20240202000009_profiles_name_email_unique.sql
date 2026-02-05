-- 이메일 단일 unique 제거, 이름+이메일 복합 unique로 변경
-- 이메일이 없는 경우도 허용하고, 이름과 이메일이 둘 다 동일할 때만 중복으로 간주

-- 1. 기존 이메일 unique 제약 제거
alter table public.profiles drop constraint if exists profiles_email_key;

-- 2. 이메일 nullable 허용 (이메일 없는 프로필 허용)
alter table public.profiles alter column email drop not null;

-- 3. 이름(name_ko) + 이메일 복합 unique 제약 추가
-- PostgreSQL: UNIQUE에서 NULL은 서로 다른 값으로 간주되므로,
-- 이메일이 NULL인 행은 이름이 같아도 여러 개 허용됨
-- (name_ko, email) 둘 다 동일한 경우에만 중복 에러 발생
alter table public.profiles
  add constraint profiles_name_ko_email_key unique (name_ko, email);
