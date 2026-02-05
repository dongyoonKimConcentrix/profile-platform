-- domain 제약 조건 수정
-- 기존 제약 조건을 제거하고 다시 생성

-- 기존 제약 조건 제거
alter table public.profiles drop constraint if exists profiles_domain_check;

-- 새로운 제약 조건 추가
-- 배열이 null이거나, 모든 요소가 허용된 값 중 하나인지 확인
alter table public.profiles add constraint profiles_domain_check 
  check (
    domain is null or 
    (
      -- 빈 배열도 허용
      array_length(domain, 1) is null or
      -- 모든 요소가 허용된 값 중 하나인지 확인
      domain <@ array['finance', 'ecommerce', 'healthcare', 'education', 'manufacturing', 'logistics']::text[]
    )
  );
