/**
 * 간단한 파일 파싱 서버
 * PDF, Word, PPT 파일에서 텍스트를 추출합니다.
 * 
 * 설치:
 * npm install express multer pdf-parse mammoth
 * 
 * 실행:
 * node n8n/scripts/simple-parsing-server.js
 */

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 임시 파일 저장 디렉토리
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB 제한
});

app.use(express.json());

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post('/parse', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    let text = '';

    console.log(`Parsing file: ${fileName}, Type: ${fileType}`);

    // PDF 파일 파싱
    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    }
    // Word 파일 파싱 (.docx)
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             fileType === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }
    // PPT 파일 파싱 (.pptx) - 기본적인 텍스트만 추출
    else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
             fileType === 'application/vnd.ms-powerpoint') {
      // PPT 파싱은 복잡하므로 간단한 메시지 반환
      // 실제 구현 시 officegen 또는 다른 라이브러리 필요
      text = `[PPT 파일: ${fileName}]\nPPT 파일 파싱은 현재 지원되지 않습니다. PDF나 Word 형식으로 변환해주세요.`;
    }
    else {
      return res.status(400).json({ 
        error: `Unsupported file type: ${fileType}`,
        supportedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
      });
    }

    // 임시 파일 삭제
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ 
      text: text.trim(),
      fileName: fileName,
      fileType: fileType
    });

  } catch (error) {
    console.error('Parsing error:', error);
    
    // 에러 발생 시에도 임시 파일 삭제
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to delete temp file:', e);
      }
    }

    res.status(500).json({ 
      error: error.message || 'Failed to parse file',
      details: error.stack
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'file-parsing-server' });
});

app.listen(PORT, () => {
  console.log(`File parsing server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Parse endpoint: http://localhost:${PORT}/parse`);
});
