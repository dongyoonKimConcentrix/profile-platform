-- domain 필드를 배열로 변경
-- 기존 단일 값 domain을 배열로 변환

-- 1. 기존 domain 값을 임시 컬럼에 백업
alter table public.profiles add column if not exists domain_backup text;
update public.profiles set domain_backup = domain where domain is not null;

-- 2. 기존 체크 제약 조건 제거 (있을 경우)
alter table public.profiles drop constraint if exists profiles_domain_check;

-- 3. domain 컬럼을 text[] 배열로 변경
alter table public.profiles alter column domain type text[] using 
  case 
    when domain is not null then array[domain]
    else null
  end;

-- 4. domain 배열에 대한 체크 제약 조건 추가
-- 배열의 모든 요소가 허용된 값 중 하나인지 확인
-- PostgreSQL의 배열 포함 연산자(<@)를 사용하여 모든 요소가 허용된 값인지 확인
alter table public.profiles add constraint profiles_domain_check 
  check (
    domain is null or 
    (
      array_length(domain, 1) is null or
      domain <@ array['finance', 'ecommerce', 'healthcare', 'education', 'manufacturing', 'logistics']::text[]
    )
  );

-- 5. 임시 백업 컬럼 제거
alter table public.profiles drop column if exists domain_backup;

-- 6. 인덱스 재생성 (배열용 GIN 인덱스)
drop index if exists profiles_domain_idx;
create index if not exists profiles_domain_idx on public.profiles using gin(domain);
