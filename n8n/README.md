# n8n 파일 처리 워크플로우

이 디렉토리에는 파일 업로드부터 Supabase 저장까지의 n8n 워크플로우가 포함되어 있습니다.

## 워크플로우 개요

1. **파일 업로드** - Webhook을 통해 PDF, Word, PPT 파일 수신
2. **파일 파싱** - 파일 포맷 자동 인식 및 텍스트 추출
3. **AI 분석** - 텍스트에서 구조화된 데이터 추출 및 벡터 임베딩 생성
4. **DB 저장** - Supabase(pgvector)에 보안 저장

## 사전 준비

### 1. 파일 파싱 서버 설정 (필수)

n8n의 기본 노드에는 PDF/Word/PPT 파싱 기능이 없으므로 별도의 파싱 서버가 필요합니다.

#### 파싱 서버 설치 및 실행

```bash
# 파싱 서버 디렉토리로 이동
cd n8n/scripts

# 의존성 설치
npm install

# 서버 실행
npm start
```

서버가 실행되면 `http://localhost:3000`에서 동작합니다.

#### 지원 파일 형식
- ✅ PDF (`.pdf`)
- ✅ Word (`.docx`, `.doc`)
- ⚠️ PPT (`.pptx`, `.ppt`) - 기본 지원, 상세 파싱은 추가 구현 필요

## 설정 방법

### 1. n8n 워크플로우 가져오기

1. n8n 대시보드 접속 (http://localhost:5678)
2. "Workflows" 메뉴 클릭
3. "Import from File" 클릭
4. `n8n/workflows/file-processing-workflow.json` 파일 선택

### 2. Credentials 설정

워크플로우를 가져온 후 다음 Credentials를 설정해야 합니다:

#### OpenAI API Credentials
1. "Credentials" 메뉴로 이동
2. "Add Credential" 클릭
3. "OpenAI" 선택
4. API Key 입력 (OpenAI에서 발급받은 키)

#### Supabase API Credentials
1. "Credentials" 메뉴로 이동
2. "Add Credential" 클릭
3. "Supabase" 선택
4. 다음 정보 입력:
   - **Host**: `your-project.supabase.co`
   - **Service Role Secret**: Supabase 대시보드의 Settings > API에서 확인
   - **Schema**: `public`

### 3. 워크플로우 활성화

1. 워크플로우 편집 화면에서 "Active" 토글을 켜기
2. Webhook URL 확인 (예: `http://localhost:5678/webhook/file-upload`)

## 사용 방법

### 파일 업로드 API 호출

```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/resume.pdf"
```

또는 JavaScript/TypeScript에서:

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:5678/webhook/file-upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## 워크플로우 노드 설명

### 1. Webhook - File Upload
- HTTP POST 요청을 받아 파일 업로드 처리
- 경로: `/webhook/file-upload`

### 2. Set File Info
- 업로드된 파일의 메타데이터 추출 (파일명, 타입 등)

### 3. Check File Type
- 파일 타입 확인 (PDF, Word, PPT)
- 각 타입에 맞는 파서로 라우팅

### 4. Extract PDF/Word/PPT Text
- 파일 포맷에 맞는 텍스트 추출
- PDF: `extractPdf` 노드 사용
- Word/PPT: `extractFromFile` 노드 사용

### 5. Merge Extracted Text
- 추출된 텍스트 통합

### 6. AI Analysis - Extract Data
- OpenAI GPT-4를 사용하여 텍스트에서 구조화된 데이터 추출
- 추출 항목:
  - 이름, 이메일, 전화번호
  - 직무, 경력
  - 도메인 경험
  - 기술 스택
  - 설명

### 7. Generate Embedding
- OpenAI Embedding API를 사용하여 벡터 임베딩 생성
- 모델: `text-embedding-3-small` (1536차원)

### 8. Prepare Supabase Data
- AI 분석 결과와 임베딩을 Supabase 형식으로 변환
- 벡터를 PostgreSQL 배열 형식으로 변환

### 9. Save to Supabase
- Supabase에 프로필 데이터 저장
- Operation: **"Create a new row"** 선택
- Table: `profiles`
- `profiles` 테이블에 새 레코드 삽입

### 10. Respond Success/Error
- 성공/실패 응답 반환

## 환경 변수 설정

n8n을 실행할 때 다음 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 생성
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password
N8N_ENCRYPTION_KEY=your-encryption-key
```

## 보안 고려사항

1. **Webhook 보안**: 프로덕션 환경에서는 Webhook에 인증 추가 권장
2. **API 키 보안**: Credentials는 n8n의 암호화된 저장소에 안전하게 보관됨
3. **RLS 정책**: Supabase의 RLS 정책으로 데이터 접근 제어
4. **Service Role Key**: Supabase Service Role Key는 절대 클라이언트에 노출하지 말 것

## 트러블슈팅

### 파일 파싱 실패
- 파일이 손상되었거나 지원하지 않는 포맷인지 확인
- n8n 로그에서 상세 에러 메시지 확인

### AI 분석 실패
- OpenAI API 키가 유효한지 확인
- API 사용량 한도 확인
- 프롬프트 형식 확인

### Supabase 저장 실패
- Supabase Credentials 확인
- RLS 정책 확인 (Service Role Key 사용 시 RLS 우회)
- 테이블 스키마 확인

## 참고 자료

- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [pgvector 문서](https://github.com/pgvector/pgvector)
