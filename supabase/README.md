# Supabase 데이터베이스 마이그레이션

이 디렉토리에는 Supabase 데이터베이스 스키마 및 RLS 정책 마이그레이션 파일이 포함되어 있습니다.

## 마이그레이션 실행 순서

Supabase 대시보드의 SQL Editor에서 다음 순서로 실행하세요:

### 1. 초기 스키마 생성 (`001_initial_schema.sql`)

이 마이그레이션은 다음을 생성합니다:
- `vector` 확장 (pgvector)
- `admin_users` 테이블 (관리자 계정)
- `profiles` 테이블 (인력 프로필)
- `profile_capabilities` 테이블 (인력 역량)
- `profile_projects` 테이블 (프로젝트 이력)
- 인덱스 및 트리거

### 2. RLS 정책 설정 (`002_rls_policies.sql`)

이 마이그레이션은 다음을 설정합니다:
- 모든 테이블에 RLS 활성화
- 관리자만 데이터 생성/수정/삭제 가능
- 인증된 사용자는 조회만 가능

## pgvector 활용

### 벡터 임베딩 저장

```sql
-- 프로필에 임베딩 벡터 업데이트 (1536차원 예시)
UPDATE profiles 
SET embedding = '[0.1, 0.2, ...]'::vector 
WHERE id = 'profile_id';
```

### 벡터 유사도 검색

```sql
-- 코사인 유사도 검색
SELECT 
  id, 
  name,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity
FROM profiles
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

### HNSW 인덱스

`001_initial_schema.sql`에서 이미 HNSW 인덱스가 생성되어 있습니다:

```sql
create index profiles_embedding_idx on public.profiles 
using hnsw (embedding vector_cosine_ops);
```

이 인덱스는 벡터 유사도 검색 성능을 크게 향상시킵니다.

## 보안

모든 테이블에 RLS가 활성화되어 있으며:
- ✅ 관리자만 데이터 생성/수정/삭제 가능
- ✅ 인증된 사용자는 조회만 가능
- ✅ 비인증 사용자는 접근 불가
