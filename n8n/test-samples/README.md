# 테스트 샘플 파일

이 디렉토리에는 n8n 워크플로우 테스트에 사용할 수 있는 샘플 파일들이 포함되어 있습니다.

## 파일 목록

- `sample-resume.txt` - 테스트용 이력서 텍스트 (PDF/Word 파일 생성 시 참고)
- `test-commands.sh` - 자동화된 테스트 스크립트

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

```bash
cd n8n/test-samples
./test-commands.sh
```

### 3. 수동 테스트

#### PDF 파일 테스트
```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@sample-resume.pdf"
```

#### Word 파일 테스트
```bash
curl -X POST http://localhost:5678/webhook/file-upload \
  -F "file=@sample-resume.docx"
```

## 주의사항

- 실제 이력서 파일은 개인정보가 포함되어 있을 수 있으므로 주의하세요
- 테스트용 샘플 파일만 사용하세요
- 프로덕션 환경에서는 실제 파일을 업로드하기 전에 검토하세요
