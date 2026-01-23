# n8n 워크플로우 테스트 가이드

이 문서는 n8n 파일 처리 워크플로우를 테스트하는 방법을 안내합니다.

## 사전 준비

### 1. 필수 서비스 실행 확인

#### 파싱 서버 실행
```bash
cd n8n/scripts
npm install  # 최초 1회만
npm start
```

서버가 정상 실행되면:
- Health check: `http://localhost:3000/health`
- Parse endpoint: `http://localhost:3000/parse`

#### n8n 실행
```bash
n8n
```

n8n이 정상 실행되면:
- 대시보드: `http://localhost:5678`
- 워크플로우가 Active 상태인지 확인

### 2. Credentials 설정 확인

#### OpenAI API
- Credentials 메뉴에서 OpenAI API 키가 설정되어 있는지 확인
- API 키가 유효한지 확인

#### Supabase API
- Credentials 메뉴에서 Supabase 연결 정보 확인
- Host, Service Role Secret이 올바른지 확인

## 테스트 시나리오

### 시나리오 1: PDF 파일 업로드 테스트

#### 1단계: 테스트 파일 준비

샘플 이력서 PDF 파일을 준비하거나 아래 내용으로 테스트 파일 생성:

**테스트용 이력서 내용 (예시):**
```
이름: 홍길동
이메일: hong@example.com
전화번호: 010-1234-5678

직무: 프론트엔드 개발자
경력: 5년 (senior)

도메인 경험:
- 금융
- 전자상거래

기술 스택:
React, TypeScript, Next.js, Node.js, PostgreSQL

상세 설명:
금융권 프로젝트에서 3년간 프론트엔드 개발 경험 보유.
전자상거래 플랫폼 구축 경험 2년.
```

#### 2단계: 워크플로우 실행

**방법 A: cURL 사용**
```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@/path/to/test-resume.pdf" \
  -v
```

**방법 B: Postman 사용**
1. Postman 열기
2. 새 Request 생성
3. Method: `POST`
4. URL: `http://localhost:5678/webhook/file-upload`
5. Body → form-data 선택
6. Key: `file` (타입: File)
7. Value: 파일 선택
8. Send 클릭

**방법 C: n8n Execute Workflow 사용**
1. n8n 대시보드에서 워크플로우 열기
2. "Execute Workflow" 클릭
3. Webhook 노드에서 "Test URL" 클릭하여 URL 복사
4. 별도 터미널에서 위의 cURL 명령어 실행

#### 3단계: 각 단계별 확인

**Webhook 노드 확인**
- n8n 실행 로그에서 파일 수신 확인
- Webhook 노드의 Output에서 파일 정보 확인

**Set File Info 노드 확인**
- 파일명, 파일 타입이 올바르게 추출되었는지 확인

**Check File Type 노드 확인**
- 파일 타입이 올바르게 인식되었는지 확인

**Extract Text from File (HTTP) 노드 확인**
- 파싱 서버 로그 확인:
  ```bash
  # 파싱 서버 터미널에서 확인
  Parsing file: test-resume.pdf, Type: application/pdf
  ```
- 노드 Output에서 추출된 텍스트 확인

**AI Analysis 노드 확인**
- OpenAI API 호출 성공 여부 확인
- 추출된 구조화된 데이터 확인:
  ```json
  {
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "position": "frontend",
    "experience": "senior",
    "domain": ["finance", "ecommerce"],
    "skills": ["React", "TypeScript", "Next.js"],
    "description": "..."
  }
  ```

**Generate Embedding 노드 확인**
- 임베딩 벡터가 생성되었는지 확인
- 벡터 차원이 1536인지 확인

**Prepare Supabase Data 노드 확인**
- 데이터가 올바른 형식으로 변환되었는지 확인
- embedding이 문자열 배열 형식인지 확인

**Save to Supabase 노드 확인**
- Supabase 대시보드에서 `profiles` 테이블 확인
- 새 레코드가 생성되었는지 확인
- 모든 필드가 올바르게 저장되었는지 확인

**Respond Success 노드 확인**
- 최종 응답 확인:
  ```json
  {
    "success": true,
    "message": "Profile created successfully",
    "id": "uuid-here"
  }
  ```

### 시나리오 2: Word 파일 업로드 테스트

#### 테스트 파일 준비
- `.docx` 형식의 Word 파일 준비
- 위와 동일한 내용으로 Word 문서 생성

#### 실행
```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@/path/to/test-resume.docx"
```

#### 확인 사항
- Word 파일 파싱이 정상 작동하는지 확인
- 텍스트 추출이 올바른지 확인

### 시나리오 3: 에러 처리 테스트

#### 지원하지 않는 파일 형식 테스트
```bash
# 이미지 파일 업로드 시도
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@/path/to/image.jpg"
```

**예상 결과:**
- 파싱 서버에서 "Unsupported file type" 에러 반환
- 워크플로우에서 에러 처리 확인

#### 빈 파일 테스트
```bash
# 빈 파일 생성 후 업로드
touch empty.pdf
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@empty.pdf"
```

## 단계별 디버깅

### 1. Webhook 수신 확인

**n8n 로그 확인:**
```bash
# n8n 실행 터미널에서 로그 확인
# 또는 n8n 대시보드의 Execution Log 확인
```

**Webhook URL 확인:**
- n8n 대시보드 → 워크플로우 → Webhook 노드
- "Test URL" 클릭하여 URL 복사
- URL이 올바른지 확인: `http://localhost:5678/webhook/file-upload`

### 2. 파싱 서버 확인

**Health Check:**
```bash
curl http://localhost:3000/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "service": "file-parsing-server"
}
```

**파싱 서버 로그 확인:**
- 파싱 서버 실행 터미널에서 로그 확인
- 파일 수신, 파싱 진행, 에러 메시지 확인

### 3. OpenAI API 확인

**API 키 유효성 확인:**
- OpenAI 대시보드에서 API 키 상태 확인
- 사용량 한도 확인

**에러 발생 시:**
- n8n Execution Log에서 상세 에러 메시지 확인
- OpenAI API 응답 확인

### 4. Supabase 연결 확인

**연결 테스트:**
- n8n에서 Supabase 노드의 "Test" 기능 사용
- Credentials가 올바른지 확인

**데이터 확인:**
- Supabase 대시보드 → Table Editor → `profiles` 테이블
- 새로 생성된 레코드 확인

## 예상 결과

### 성공 케이스

**최종 응답:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Supabase 데이터:**
- `profiles` 테이블에 새 레코드 생성
- 모든 필드가 올바르게 저장됨
- `embedding` 필드에 벡터 데이터 저장됨

### 실패 케이스

**파일 파싱 실패:**
```json
{
  "success": false,
  "error": "Failed to parse file: Unsupported file type"
}
```

**AI 분석 실패:**
- OpenAI API 에러 메시지 확인
- API 키, 사용량 한도 확인

**Supabase 저장 실패:**
- 제약 조건 위반 에러 확인
- 데이터 형식 확인

## 트러블슈팅

### 문제: "Connection refused" 에러

**원인:** 파싱 서버가 실행되지 않음

**해결:**
```bash
cd n8n/scripts
npm start
```

### 문제: "No file uploaded" 에러

**원인:** 파일이 제대로 전달되지 않음

**해결:**
- cURL 명령어에서 `-F "file=@..."` 형식 확인
- 파일 경로가 올바른지 확인
- 파일이 존재하는지 확인

### 문제: "Unsupported file type" 에러

**원인:** 지원하지 않는 파일 형식

**해결:**
- PDF, Word (.docx, .doc) 형식만 지원
- 파일 형식 확인

### 문제: OpenAI API 에러

**원인:** API 키 문제 또는 사용량 한도

**해결:**
- API 키가 올바른지 확인
- OpenAI 대시보드에서 사용량 확인
- API 키 권한 확인

### 문제: Supabase 저장 실패

**원인:** 데이터 형식 불일치 또는 제약 조건 위반

**해결:**
- Prepare Supabase Data 노드의 출력 확인
- Supabase 테이블 스키마 확인
- RLS 정책 확인

## 테스트 체크리스트

- [ ] 파싱 서버 실행 확인
- [ ] n8n 실행 확인
- [ ] OpenAI Credentials 설정 확인
- [ ] Supabase Credentials 설정 확인
- [ ] 워크플로우 Active 상태 확인
- [ ] Webhook URL 확인
- [ ] PDF 파일 업로드 테스트
- [ ] Word 파일 업로드 테스트
- [ ] Supabase에 데이터 저장 확인
- [ ] 에러 처리 테스트

## 추가 테스트

### 대용량 파일 테스트
- 10MB 이상의 PDF 파일 테스트
- 파싱 시간 및 메모리 사용량 확인

### 동시 요청 테스트
- 여러 파일을 동시에 업로드
- 워크플로우 동시 실행 확인

### 다양한 형식의 이력서 테스트
- 다양한 레이아웃의 이력서
- 다양한 언어의 이력서
- AI 분석 정확도 확인

## 참고 자료

- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- `n8n/README.md` - 전체 가이드
- `n8n/QUICK_START.md` - 빠른 시작 가이드
