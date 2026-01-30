#!/bin/bash

# n8n 워크플로우 테스트 스크립트
# 사용법: ./test-commands.sh [파일경로]
# 예시: ./test-commands.sh "주요인력프로필_김콘센.pptx"

WEBHOOK_URL="http://localhost:5678/webhook/file-upload"
PARSING_SERVER="http://localhost:3000"

# 한글 파일명 처리를 위한 함수
upload_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    if [ ! -f "$file_path" ]; then
        echo "❌ 파일을 찾을 수 없습니다: $file_path"
        return 1
    fi
    
    echo "📤 파일 업로드 중: $file_name"
    
    # 한글 파일명 처리를 위해 파일 경로를 직접 사용
    # macOS/Linux에서 한글 파일명은 UTF-8로 처리됨
    curl -X POST "$WEBHOOK_URL" \
        --form-string "file=@$file_path" \
        -w "\nHTTP Status: %{http_code}\n" \
        -H "Content-Type: multipart/form-data" \
        2>/dev/null | jq . 2>/dev/null || echo "응답을 JSON으로 파싱할 수 없습니다."
    
    return $?
}

echo "=== n8n 워크플로우 테스트 스크립트 ==="
echo ""

# 커맨드라인 인자로 파일 경로가 제공된 경우
if [ $# -gt 0 ]; then
    FILE_PATH="$1"
    echo "📁 지정된 파일: $FILE_PATH"
    upload_file "$FILE_PATH"
    echo ""
    echo "=== 테스트 완료 ==="
    exit 0
fi

# 1. 파싱 서버 Health Check
echo "1. 파싱 서버 Health Check..."
if command -v jq &> /dev/null; then
    curl -s $PARSING_SERVER/health 2>/dev/null | jq . 2>/dev/null || echo "파싱 서버 응답을 확인할 수 없습니다."
else
    curl -s $PARSING_SERVER/health 2>/dev/null || echo "파싱 서버 응답을 확인할 수 없습니다."
fi
echo ""

# 2. Webhook URL 확인
echo "2. Webhook URL 확인..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# 3. PDF 파일 업로드 테스트 (파일이 있는 경우)
if [ -f "sample-resume.pdf" ]; then
    echo "3. PDF 파일 업로드 테스트..."
    upload_file "sample-resume.pdf"
    echo ""
else
    echo "3. PDF 파일이 없습니다. sample-resume.pdf 파일을 준비해주세요."
    echo ""
fi

# 4. Word 파일 업로드 테스트 (파일이 있는 경우)
if [ -f "sample-resume.docx" ]; then
    echo "4. Word 파일 업로드 테스트..."
    upload_file "sample-resume.docx"
    echo ""
else
    echo "4. Word 파일이 없습니다. sample-resume.docx 파일을 준비해주세요."
    echo ""
fi

# 5. PPT 파일 업로드 테스트 (한글 파일명 포함)
for ppt_file in *.pptx *.ppt; do
    if [ -f "$ppt_file" ]; then
        echo "5. PPT 파일 업로드 테스트: $ppt_file"
        upload_file "$ppt_file"
        echo ""
        break
    fi
done

# 6. 에러 케이스 테스트 - 지원하지 않는 파일 형식
if [ -f "test-image.jpg" ]; then
    echo "6. 에러 케이스 테스트 (지원하지 않는 파일 형식)..."
    upload_file "test-image.jpg"
    echo ""
fi

echo "=== 테스트 완료 ==="
echo ""
echo "💡 팁: 특정 파일을 테스트하려면 다음 명령어를 사용하세요:"
echo "   ./test-commands.sh \"파일경로\""
echo "   예시: ./test-commands.sh \"주요인력프로필_김콘센.pptx\""