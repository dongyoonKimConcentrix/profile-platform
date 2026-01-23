# Supabase MCP 설정 가이드

## MCP (Model Context Protocol)란?

MCP는 AI 도구(Cursor, Claude 등)가 Supabase 프로젝트에 연결되어 데이터베이스 쿼리, 스키마 관리, 마이그레이션 등을 자연어로 수행할 수 있게 해주는 프로토콜입니다.

## 설치 완료

`@supabase/mcp-server-supabase` 패키지가 설치되었습니다.

## Cursor에서 MCP 설정하기

### 방법 1: Cursor 설정 파일 직접 수정 (권장)

1. **Cursor 설정 파일 위치**
   - macOS: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - 또는 Cursor 메뉴: `Cursor` → `Settings` → `Features` → `MCP Servers`

2. **설정 파일에 다음 내용 추가:**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--project-url",
        "${SUPABASE_URL}",
        "--anon-key",
        "${SUPABASE_ANON_KEY}"
      ],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL_HERE",
        "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY_HERE"
      }
    }
  }
}
```

3. **환경 변수 값 입력**
   - `SUPABASE_URL`: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` 값
   - `SUPABASE_ANON_KEY`: `.env.local`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값

### 방법 2: 프로젝트 로컬 설정 파일 사용

프로젝트 루트에 `.cursor/mcp.json` 파일을 생성하고 다음 내용을 추가:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--project-url",
        "${SUPABASE_URL}",
        "--anon-key",
        "${SUPABASE_ANON_KEY}"
      ],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL_HERE",
        "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY_HERE"
      }
    }
  }
}
```

## 환경 변수 확인

`.env.local` 파일에서 다음 값들을 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

이 값들을 MCP 설정 파일의 `SUPABASE_URL`과 `SUPABASE_ANON_KEY`에 입력하세요.

## 보안 고려사항

### RLS (Row Level Security)

MCP를 통해 접근할 때도 RLS 정책이 적용됩니다:
- ✅ 관리자만 데이터 생성/수정/삭제 가능
- ✅ 인증된 사용자는 조회만 가능
- ✅ 비인증 사용자는 접근 불가

### 권한 설정

- **읽기 전용 모드**: 프로덕션 데이터에 접근할 때는 읽기 전용 계정 사용 권장
- **개발 모드**: 개발 환경에서는 전체 권한 사용 가능

## 사용 가능한 기능

MCP를 통해 다음 작업을 수행할 수 있습니다:

1. **데이터베이스 쿼리**
   - SELECT, INSERT, UPDATE, DELETE
   - 벡터 유사도 검색 (pgvector)

2. **스키마 관리**
   - 테이블 생성/수정
   - 인덱스 관리
   - RLS 정책 확인

3. **마이그레이션**
   - SQL 마이그레이션 실행
   - 스키마 변경 추적

4. **인증 관리**
   - 사용자 조회
   - 역할 확인

## 테스트

MCP가 정상적으로 작동하는지 확인:

1. Cursor를 재시작
2. Cursor에서 MCP 서버 연결 확인
3. 간단한 쿼리 테스트:
   ```
   "Supabase에서 profiles 테이블의 모든 데이터를 조회해줘"
   ```

## 문제 해결

### MCP 서버가 연결되지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트 URL과 키가 정확한지 확인
3. RLS 정책이 올바르게 설정되었는지 확인
4. Cursor를 재시작

### 권한 오류가 발생하는 경우

1. 관리자 계정이 `admin_users` 테이블에 등록되어 있는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인

## 참고 자료

- [Supabase MCP 문서](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io)
- [@supabase/mcp-server-supabase npm 패키지](https://www.npmjs.com/package/@supabase/mcp-server-supabase)
