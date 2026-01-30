# 테스트 샘플 파일

이 디렉토리에는 n8n 워크플로우 테스트에 사용할 수 있는 샘플 파일들이 포함되어 있습니다.

## 파일 목록

- `sample-resume.txt` - 테스트용 이력서 텍스트 (PDF/Word 파일 생성 시 참고)
- `test-commands.sh` - 자동화된 테스트 스크립트
- `upload-file.sh` - 한글 파일명 지원 업로드 스크립트

## 사용 방법

### 1. 샘플 파일 생성

#### PDF 파일 생성 (선택사항)
`sample-resume.txt` 내용을 참고하여 PDF 파일을 생성하세요.

온라인 도구 사용:
- [PDF24](https://tools.pdf24.org/ko/create-pdf)
- [SmallPDF](https://smallpdf.com/kr/txt-to-pdf)

또는 Word에서:
1. `sample-resume.txt` 내용을 Word 문서로 복사
2. "다른 이름으로 저장" → PDF 형식 선택

#### Word 파일 생성 (선택사항)
1. `sample-resume.txt` 내용을 Word 문서로 복사
2. `.docx` 형식으로 저장

### 2. 테스트 스크립트 실행

#### 전체 테스트 실행
```bash
cd n8n/test-samples
./test-commands.sh
```

#### 특정 파일 테스트 (한글 파일명 지원)
```bash
cd n8n/test-samples
./test-commands.sh "주요인력프로필_김콘센.pptx"
```

#### 업로드 전용 스크립트 사용 (한글 파일명 완벽 지원)
```bash
cd n8n/test-samples

# 기본 webhook URL 사용
./upload-file.sh "주요인력프로필_김콘센.pptx"

# 커스텀 webhook URL 사용
./upload-file.sh "주요인력프로필_김콘센.pptx" "http://localhost:5678/webhook-test/file-upload"
```

### 3. 수동 테스트 (한글 파일명 주의)

#### 영문 파일명 테스트
```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@sample-resume.pdf"
```

#### 한글 파일명 테스트 (권장: 스크립트 사용)
한글 파일명이 포함된 경우 스크립트를 사용하는 것을 권장합니다:

```bash
# 방법 1: 스크립트 사용 (권장)
./upload-file.sh "주요인력프로필_김콘센.pptx"

# 방법 2: 직접 curl 사용 (터미널 인코딩에 따라 실패할 수 있음)
cd /Users/dongyoon/workspace/profile/n8n/test-samples
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@주요인력프로필_김콘센.pptx"
```

## 한글 파일명 처리

### 문제점
한글 파일명이 포함된 경로를 curl 명령어에서 직접 사용하면 터미널 인코딩 문제로 파일을 찾지 못할 수 있습니다.

### 해결 방법
1. **스크립트 사용 (권장)**: `upload-file.sh` 또는 `test-commands.sh` 사용
2. **절대 경로 사용**: 파일의 절대 경로를 사용
3. **파일명 변경**: 테스트 시 임시로 영문 파일명으로 변경

### 예시
```bash
# ✅ 권장: 스크립트 사용
./upload-file.sh "주요인력프로필_김콘센.pptx"

# ✅ 절대 경로 사용
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@/Users/dongyoon/workspace/profile/n8n/test-samples/주요인력프로필_김콘센.pptx"

# ❌ 상대 경로 직접 사용 (터미널에 따라 실패할 수 있음)
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@주요인력프로필_김콘센.pptx"
```

## 주의사항

- 실제 이력서 파일은 개인정보가 포함되어 있을 수 있으므로 주의하세요
- 테스트용 샘플 파일만 사용하세요
- 프로덕션 환경에서는 실제 파일을 업로드하기 전에 검토하세요
- 한글 파일명이 포함된 경우 스크립트를 사용하는 것을 권장합니다