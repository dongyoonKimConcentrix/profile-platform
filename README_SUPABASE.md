# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트 생성
2. 프로젝트 URL과 API 키 확인

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 데이터베이스 마이그레이션 실행

Supabase 대시보드의 SQL Editor에서 다음 순서로 마이그레이션을 실행하세요:

1. `supabase/migrations/001_initial_schema.sql` - 스키마 및 pgvector 확장
2. `supabase/migrations/002_rls_policies.sql` - RLS 정책 설정

## 4. pgvector 확장 확인

마이그레이션 후 다음 SQL로 확장이 활성화되었는지 확인:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## 5. 초기 관리자 계정 생성

Supabase 대시보드의 Authentication에서 관리자 계정을 생성한 후, SQL Editor에서 다음을 실행:

```sql
-- 관리자 계정 생성 (user_id는 Auth.users에서 확인)
INSERT INTO public.admin_users (user_id, role)
VALUES ('관리자_사용자_UUID', 'admin');
```

## 6. RLS 정책 확인

다음 SQL로 RLS가 활성화되었는지 확인:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_users', 'profiles', 'profile_capabilities', 'profile_projects');
```

## 7. 벡터 검색 테스트

임베딩 벡터를 생성하고 검색 테스트:

```sql
-- 임베딩 벡터 업데이트 예시 (1536차원)
UPDATE profiles 
SET embedding = '[0.1, 0.2, ...]'::vector 
WHERE id = 'profile_id';

-- 코사인 유사도 검색 예시
SELECT id, name, 
       1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM profiles
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

## 보안 고려사항

- ✅ RLS가 모든 테이블에 활성화되어 있음
- ✅ 관리자만 데이터 생성/수정/삭제 가능
- ✅ 일반 사용자는 조회만 가능
- ✅ 인증된 사용자만 프로필 조회 가능

## 다음 단계

1. Supabase 프로젝트 생성 및 환경 변수 설정
2. 마이그레이션 실행
3. 관리자 계정 생성
4. 애플리케이션에서 Supabase 클라이언트 사용 시작
