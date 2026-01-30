#!/bin/bash

# 한글 파일명 지원 파일 업로드 스크립트
# 사용법: ./upload-file.sh [파일경로] [webhook-url]

# 기본값 설정
DEFAULT_WEBHOOK_URL="http://localhost:5678/webhook/file-upload"
WEBHOOK_URL="${2:-$DEFAULT_WEBHOOK_URL}"

# 파일 경로 확인
if [ $# -lt 1 ]; then
    echo "❌ 사용법: $0 <파일경로> [webhook-url]"
    echo "   예시: $0 \"주요인력프로필_김콘센.pptx\""
    echo "   예시: $0 \"주요인력프로필_김콘센.pptx\" \"http://localhost:5678/webhook-test/file-upload\""
    exit 1
fi

FILE_PATH="$1"

# 파일 존재 확인
if [ ! -f "$FILE_PATH" ]; then
    echo "❌ 파일을 찾을 수 없습니다: $FILE_PATH"
    exit 1
fi

# 파일명 추출 (한글 지원)
FILE_NAME=$(basename "$FILE_PATH")
FILE_DIR=$(dirname "$FILE_PATH")

# 절대 경로로 변환
if [ "$FILE_DIR" = "." ]; then
    ABSOLUTE_PATH="$(pwd)/$FILE_NAME"
else
    ABSOLUTE_PATH="$FILE_PATH"
fi

echo "📁 파일: $FILE_NAME"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""

# 한글 파일명 처리를 위한 업로드
# macOS/Linux에서 한글은 UTF-8로 처리되므로 직접 사용 가능
curl -X POST "$WEBHOOK_URL" \
    -F "file=@$ABSOLUTE_PATH" \
    -w "\n\nHTTP Status: %{http_code}\n" \
    -H "Content-Type: multipart/form-data" \
    -v 2>&1 | grep -E "(HTTP|{|\"success|\"error|\"message)" || echo "응답을 확인할 수 없습니다."

echo ""
echo "✅ 업로드 완료"
