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
- ✅ PPT (`.pptx`, `.ppt`) - 슬라이드 텍스트 + **첫 번째 이미지(프로필 사진) 추출**
- PPTX/DOCX에서 추출한 첫 이미지는 인력 프로필 사진(avatar)으로 등록됩니다.

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

## 프로필 사진(업로드 파일에서 추출)

- **PPTX/DOCX** 업로드 시 파싱 서버가 `ppt/media/` 또는 `word/media/`에서 **첫 번째 이미지**를 추출해 `imageBase64`로 반환합니다.
- n8n 워크플로의 **Upload Image** 노드가 이 이미지를 Next.js API(`/api/n8n/upload-avatar`)로 보내 Supabase Storage에 올리고, 반환된 URL을 `photo_url`로 프로필에 저장합니다.

### 사진 기능 사용 전 준비

1. **Supabase Storage 버킷 (필수 – 없으면 `_uploadError: "Bucket not found"` 발생)**
   - Supabase 대시보드 → **Storage** → **New bucket**
   - 이름: **`avatars`** (정확히 이 이름), **Public bucket** 체크 후 생성

2. **Next.js 환경 변수** (`.env.local`)
   - `N8N_AVATAR_UPLOAD_SECRET`: (선택) `/api/n8n/upload-avatar` 호출 시 헤더 `x-n8n-avatar-secret`과 일치시킬 값. 비우면 검사 생략.

3. **n8n 앱 URL 설정 (필수)**
   - 워크플로 JSON에는 **환경 변수(`$env`)를 사용하지 않습니다.** (n8n에서 env 접근이 제한된 환경에서도 동작하도록 기본값만 넣어 둡니다.)
   - **Merge Extracted Text** 노드에서 직접 입력:  
     n8n 워크플로 편집 화면에서 **Merge Extracted Text** 노드를 더블클릭한 뒤,  
     **Values** 안의 **`_appUrl`**을 실제 Next.js 앱 URL로, **`_secret`**을 API 시크릿(선택)으로 바꾸세요.  
     (예: `_appUrl` → `https://실제도메인.com` 또는 로컬 `http://localhost:3000`)
   - n8n Variables/Pro를 쓰는 경우: 해당 노드의 `_appUrl` / `_secret` 필드에 UI에서만 `{{ $env.N8N_APP_URL }}` 등으로 입력할 수 있습니다. (워크플로 JSON 기본값은 고정 placeholder입니다.)
   - 앱 URL이 비어 있거나 placeholder이면 Upload Image 노드 출력이 항상 `photo_url: null`이 됩니다.

   **로컬에서만 테스트할 때 (도메인 없음)**  
   - **Merge Extracted Text** 노드의 **`_appUrl`** 값을 로컬 주소로 설정하면 됩니다.  
   - Next.js를 `npm run dev`로 실행했다면: **`http://localhost:3000`**  
   - n8n을 **Docker**로 실행 중이면, 컨테이너 안의 `localhost`는 n8n 자신을 가리키므로 다음처럼 설정하세요.  
     - **Mac / Windows**: **`http://host.docker.internal:3000`**  
     - **Linux**: 호스트 IP(예: `http://172.17.0.1:3000`) 또는 Docker 실행 시 `--add-host=host.docker.internal:host-gateway` 추가 후 `http://host.docker.internal:3000`  
   - n8n과 Next.js를 **같은 PC에서 프로세스로만** 실행 중이면 `http://localhost:3000`으로 설정해도 됩니다.

4. **Merge 구조 (입력 2개 제한 대응)**
   - n8n Merge 노드는 **입력이 최대 2개**라서, 2단계로 합칩니다.
   - **Merge AI and Embedding**: 입력 2개 — **AI Analysis - Extract Data**, **HTTP Request**(Embedding). 여기에는 Upload Image를 연결하지 않습니다.
   - **Merge With Photo**: 입력 2개 — **Merge AI and Embedding** 출력, **Upload Image** 출력.
   - n8n UI에서: **Upload Image** 노드의 출력 → **Merge With Photo** 노드의 **두 번째 입력**에 연결하세요. 연결이 없으면 `photo_url`이 Prepare Supabase Data로 전달되지 않습니다.

5. **Prepare Supabase Data** (코드 노드)
   - Merge에서 넘어온 항목 중 `photo_url`을 읽어 반환 객체에 넣어야 합니다.
   - 변수: `let photoUrl = null;` 추가
   - 루프 안: `if (json.photo_url != null) photoUrl = json.photo_url;`
   - `return` 객체에 `photo_url: photoUrl` 추가

6. **DB 마이그레이션**
   - `supabase/migrations/20240202100000_profile_photo_url.sql` 적용해 `profiles.photo_url` 컬럼 추가

## 환경 변수 설정

n8n을 실행할 때 다음 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 생성
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password
N8N_ENCRYPTION_KEY=your-encryption-key
# (선택) n8n UI에서 {{ $env.N8N_APP_URL }} 등으로 참조할 때만 사용. 워크플로 JSON 기본값은 고정 placeholder라 env 미사용.
# N8N_APP_URL=https://your-app.vercel.app
# N8N_AVATAR_UPLOAD_SECRET=your-secret
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

### Upload Image 노드에서 출력이 null일 때
- **에러 확인**: 노드 출력에 `_uploadError`, `_uploadStatus`가 추가되어 있습니다. `photo_url`이 null이면 **Upload Image** 노드 실행 결과에서 `_uploadError`를 보면 원인을 알 수 있습니다.
- **`_uploadError: "Bucket not found"`** → Supabase Storage에 **`avatars`** 버킷이 없습니다. Supabase 대시보드 → Storage → **New bucket** → 이름 **`avatars`**, **Public bucket** 체크 후 생성하세요.
- 그 외: `Unauthorized`(시크릿 불일치), `Missing image (base64)`, `Image too large (max 5MB)`, 네트워크 에러 등은 메시지대로 조치하면 됩니다.
- **입력 연결**: Upload Image의 입력이 **Merge Extracted Text** 한 개만 연결되어 있는지 확인. (Merge Extracted Text → AI Analysis / HTTP Request / Upload Image 세 갈래로 나가는 구조)
- **앱 URL**: Merge Extracted Text의 `_appUrl`이 placeholder(`https://your-app.vercel.app`)가 아닌 **실제 URL**인지 확인. 로컬이면 `http://localhost:3000`, n8n이 Docker면 `http://host.docker.internal:3000` 등.
- **본문 크기**: base64 이미지가 크면 Next.js 기본 본문 제한(1MB)에 걸릴 수 있습니다. `next.config.ts`에 `experimental.proxyClientMaxBodySize: '10mb'`가 설정되어 있으므로, 여전히 실패하면 이미지 리사이즈나 호스트별 본문 제한을 확인하세요.
- **data URL**: API는 `data:image/jpeg;base64,...` 형태도 받습니다. 워크플로의 Upload Image 노드에서 data URL을 자동으로 순수 base64로 잘라서 보내도록 되어 있습니다.

### Supabase 저장 실패 / 데이터가 DB에 없음
- **반드시 Service Role Secret 사용**: n8n Supabase 자격 증명에 **anon(public) 키가 아닌 Service Role Secret**을 넣어야 합니다.  
  - Supabase 대시보드 → Settings → API → **service_role** (secret) 복사  
  - anon 키를 쓰면 RLS 때문에 `profiles`, `profile_projects`, `profile_project_careers` INSERT가 모두 차단되어 **어떤 데이터도 저장되지 않습니다.**
- Credentials에서 **Host**, **Service Role Secret**, **Schema: public** 확인
- 마이그레이션 적용 여부: `008_profile_project_careers.sql` 등 실행해 `profile_project_careers` 테이블 존재 확인
- n8n 실행 로그에서 Insert 노드(Insert 재직이력, Insert 프로젝트 경력) 에러 메시지 확인

## 참고 자료

- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [pgvector 문서](https://github.com/pgvector/pgvector)
