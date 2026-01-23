# n8n 파일 파싱 솔루션

`extractPdf` 노드가 n8n 기본 노드에 없어서 발생한 문제입니다. 다음 방법 중 하나를 사용하세요.

## 해결 방법

### 방법 1: HTTP Request로 외부 파싱 서비스 사용 (권장)

PDF, Word, PPT 파일을 파싱하는 외부 API를 사용합니다.

#### 옵션 A: PDF.js 또는 pdf-parse 사용
- Node.js 서버에서 pdf-parse 라이브러리 사용
- n8n에서 HTTP Request로 해당 서버 호출

#### 옵션 B: Google Cloud Document AI 사용
- Google Cloud Document AI API 사용
- n8n에서 HTTP Request 노드로 호출

#### 옵션 C: AWS Textract 사용
- AWS Textract API 사용
- n8n에서 HTTP Request 노드로 호출

### 방법 2: Code 노드에서 직접 파싱 (간단한 구현)

현재 워크플로우를 수정하여 Code 노드를 사용하도록 변경했습니다. 하지만 실제 파일 파싱 로직은 추가 구현이 필요합니다.

### 방법 3: n8n 커뮤니티 노드 설치

```bash
# n8n 커뮤니티 노드 설치
npm install -g n8n-nodes-pdf
```

## 권장 구현: HTTP Request + 파싱 서비스

가장 실용적인 방법은 별도의 파싱 서비스를 만들거나 외부 API를 사용하는 것입니다.

### 예시: 간단한 파싱 서버 (Node.js)

```javascript
// parsing-server.js
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth'); // Word 파일용
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/parse', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    let text = '';

    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (file.mimetype.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    } else if (file.mimetype.includes('presentationml')) {
      // PPT 파싱 로직 (더 복잡함)
      text = 'PPT parsing not implemented';
    }

    fs.unlinkSync(file.path); // 임시 파일 삭제
    
    res.json({ text, fileName: file.originalname, fileType: file.mimetype });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Parsing server running on port 3000'));
```

### n8n에서 HTTP Request 노드 사용

1. **Extract Text from File** 노드를 **HTTP Request** 노드로 교체
2. 설정:
   - Method: `POST`
   - URL: `http://localhost:3000/parse` (또는 배포된 서버 URL)
   - Body: `Form-Data`
   - File Field: `file`
   - Binary Property: `data`

## 임시 해결책

현재 워크플로우를 수정하여 Code 노드를 사용하도록 변경했습니다. 하지만 실제 파일 파싱은 구현되지 않았으므로, 위의 방법 중 하나를 선택하여 구현해야 합니다.

## 다음 단계

1. 파일 파싱 방법 선택 (HTTP Request + 외부 서비스 권장)
2. 파싱 서비스 구현 또는 외부 API 설정
3. n8n 워크플로우에서 HTTP Request 노드로 교체
4. 테스트

어떤 방법을 사용하시겠어요?
