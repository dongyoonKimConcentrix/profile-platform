#!/bin/bash

# n8n 워크플로우 테스트 스크립트
# 사용법: ./test-commands.sh

WEBHOOK_URL="http://localhost:5678/webhook/file-upload"
PARSING_SERVER="http://localhost:3000"

echo "=== n8n 워크플로우 테스트 스크립트 ==="
echo ""

# 1. 파싱 서버 Health Check
echo "1. 파싱 서버 Health Check..."
curl -s $PARSING_SERVER/health | jq .
echo ""

# 2. Webhook URL 확인
echo "2. Webhook URL 확인..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# 3. PDF 파일 업로드 테스트 (파일이 있는 경우)
if [ -f "sample-resume.pdf" ]; then
    echo "3. PDF 파일 업로드 테스트..."
    curl -X POST $WEBHOOK_URL \
        -F "file=@sample-resume.pdf" \
        -w "\nHTTP Status: %{http_code}\n" \
        | jq .
    echo ""
else
    echo "3. PDF 파일이 없습니다. sample-resume.pdf 파일을 준비해주세요."
    echo ""
fi

# 4. Word 파일 업로드 테스트 (파일이 있는 경우)
if [ -f "sample-resume.docx" ]; then
    echo "4. Word 파일 업로드 테스트..."
    curl -X POST $WEBHOOK_URL \
        -F "file=@sample-resume.docx" \
        -w "\nHTTP Status: %{http_code}\n" \
        | jq .
    echo ""
else
    echo "4. Word 파일이 없습니다. sample-resume.docx 파일을 준비해주세요."
    echo ""
fi

# 5. 에러 케이스 테스트 - 지원하지 않는 파일 형식
if [ -f "test-image.jpg" ]; then
    echo "5. 에러 케이스 테스트 (지원하지 않는 파일 형식)..."
    curl -X POST $WEBHOOK_URL \
        -F "file=@test-image.jpg" \
        -w "\nHTTP Status: %{http_code}\n" \
        | jq .
    echo ""
fi

echo "=== 테스트 완료 ==="
