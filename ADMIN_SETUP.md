# 관리자 계정 설정 가이드

## 문제 해결 완료

관리자 로그인 시스템을 Supabase Auth를 사용하도록 수정했습니다.

## 관리자 계정 생성 방법

### 1. Supabase 대시보드에서 관리자 계정 생성

1. **Supabase 대시보드 접속**
   - [Supabase Dashboard](https://app.supabase.com)에 로그인
   - 프로젝트 선택

2. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 `Authentication` → `Users` 클릭

3. **새 사용자 추가**
   - `Add user` 또는 `Invite user` 버튼 클릭
   - 이메일과 비밀번호 입력
   - 예시:
     - 이메일: `admin@example.com`
     - 비밀번호: `your-secure-password`

4. **사용자 ID 확인**
   - 생성된 사용자의 `UUID`를 복사

### 2. admin_users 테이블에 관리자 등록

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행:

```sql
-- 사용자 ID를 위에서 복사한 UUID로 교체하세요
INSERT INTO public.admin_users (user_id, role)
VALUES ('여기에_사용자_UUID_입력', 'admin');
```

**예시:**
```sql
INSERT INTO public.admin_users (user_id, role)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin');
```

### 3. 로그인 테스트

1. `/admin/login` 페이지로 이동
2. 생성한 이메일과 비밀번호로 로그인
3. 로그인 성공 시 `/admin` 페이지로 리다이렉트됩니다

## 기존 관리자 계정 확인

현재 등록된 관리자 계정을 확인하려면:

```sql
SELECT 
  au.id,
  au.user_id,
  au.role,
  au.created_at,
  u.email
FROM public.admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id;
```

## 문제 해결

### 로그인이 안 되는 경우

1. **이메일/비밀번호 확인**
   - Supabase Authentication에서 사용자가 올바르게 생성되었는지 확인
   - 비밀번호가 올바른지 확인

2. **admin_users 테이블 확인**
   - 사용자 ID가 `admin_users` 테이블에 등록되어 있는지 확인
   - 다음 쿼리로 확인:
     ```sql
     SELECT * FROM public.admin_users WHERE user_id = '사용자_UUID';
     ```

3. **RLS 정책 확인**
   - `admin_users` 테이블의 RLS 정책이 올바르게 설정되었는지 확인
   - `002_rls_policies.sql` 마이그레이션이 실행되었는지 확인

4. **브라우저 콘솔 확인**
   - 개발자 도구(F12) → Console 탭에서 오류 메시지 확인

### "관리자 권한이 없습니다" 오류

- `admin_users` 테이블에 해당 사용자가 등록되어 있지 않음
- 위의 "admin_users 테이블에 관리자 등록" 단계를 다시 확인

### 미들웨어 리다이렉트 루프

- 로그인 후에도 계속 로그인 페이지로 리다이렉트되는 경우
- `admin_users` 테이블에 사용자가 등록되어 있는지 확인
- 브라우저 쿠키를 삭제하고 다시 시도

## 보안 권장사항

1. **강력한 비밀번호 사용**
   - 최소 12자 이상
   - 대소문자, 숫자, 특수문자 포함

2. **이메일 확인 활성화**
   - Supabase Authentication 설정에서 이메일 확인 활성화 권장

3. **2FA (Two-Factor Authentication)**
   - 가능하면 2FA 활성화 권장

4. **정기적인 보안 감사**
   - `admin_users` 테이블의 사용자 목록을 정기적으로 확인

## 다음 단계

1. 관리자 계정 생성 및 등록 완료
2. 로그인 테스트
3. 프로필 등록/수정/삭제 기능 테스트
