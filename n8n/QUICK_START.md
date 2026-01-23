# n8n 워크플로우 빠른 시작 가이드

## 문제 해결: extractPdf 노드 에러

`extractPdf` 노드는 n8n 기본 노드에 없습니다. HTTP Request 노드를 사용하여 외부 파싱 서비스를 호출하도록 워크플로우를 수정했습니다.

## 1단계: 파일 파싱 서버 실행

### 설치

```bash
cd n8n/scripts
npm install
```

### 실행

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 2단계: n8n 워크플로우 설정

### 워크플로우 가져오기

1. n8n 대시보드 접속 (http://localhost:5678)
2. "Workflows" → "Import from File"
3. `n8n/workflows/file-processing-workflow.json` 선택

### Extract Text from File 노드 설정

1. **Extract Text from File (HTTP)** 노드 클릭
2. **URL** 필드 확인:
   - 기본값: `http://localhost:3000/parse`
   - 파싱 서버가 다른 포트에서 실행 중이면 변경
3. **Method**: `POST` (기본값)
4. **Body**: `Form-Data` (기본값)
5. **File Field**: `file` (기본값)

### 바이너리 데이터 전송 확인

n8n의 HTTP Request 노드에서 바이너리 데이터를 전송할 때:
- Webhook에서 받은 파일이 `$binary.data`에 자동으로 저장됨
- Form-Data로 전송하면 자동으로 multipart/form-data 형식으로 변환됨

## 3단계: 테스트

### 워크플로우 활성화

1. 워크플로우 편집 화면에서 "Active" 토글 ON
2. Webhook URL 확인 (예: `http://localhost:5678/webhook/file-upload`)

### 파일 업로드 테스트

```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@/path/to/test.pdf"
```

## 트러블슈팅

### "Connection refused" 에러
- 파싱 서버가 실행 중인지 확인: `curl http://localhost:3000/health`
- 포트가 다른 경우 URL 수정

### "No file uploaded" 에러
- Webhook에서 파일이 제대로 전달되는지 확인
- HTTP Request 노드의 Form-Data 설정 확인

### "Unsupported file type" 에러
- 지원되는 형식: PDF, Word (.docx, .doc)
- PPT는 기본 지원만 됨 (상세 파싱은 추가 구현 필요)

## 다음 단계

파싱 서버가 정상 작동하면:
1. OpenAI Credentials 설정
2. Supabase Credentials 설정
3. 전체 워크플로우 테스트

자세한 내용은 `n8n/README.md`를 참고하세요.
