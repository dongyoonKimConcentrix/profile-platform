/**
 * 간단한 파일 파싱 서버
 * PDF, Word, PPT 파일에서 텍스트를 추출합니다.
 *
 * 설치:
 * npm install express multer pdf-parse mammoth adm-zip
 *
 * 실행:
 * node n8n/scripts/simple-parsing-server.js
 */

const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

// MIME이 비어있거나 application/octet-stream일 때 확장자로 타입 보정 (한글 파일명/n8n 전달 대응)
function resolveMimeType(mimetype, fileName) {
  const needsFallback = !mimetype || String(mimetype).trim() === '' || mimetype === 'application/octet-stream';
  if (!needsFallback) return mimetype;
  if (!fileName || typeof fileName !== 'string') return mimetype;
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain'
  };
  return map[ext] || mimetype;
}

/** PPTX(.pptx)는 ZIP 안의 XML. ppt/slides/slideN.xml에서 <a:t> 텍스트 추출 */
function extractTextFromPptx(filePath) {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.entryName.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  const parts = [];
  for (const entry of slideEntries) {
    const xml = entry.getData().toString('utf8');
    const textMatches = xml.match(/<a:t>([^<]*)<\/a:t>/g);
    if (textMatches) {
      const slideText = textMatches
        .map((m) => m.replace(/<\/?a:t>/g, '').trim())
        .filter(Boolean)
        .join(' ');
      if (slideText) parts.push(slideText);
    }
  }
  return parts.join('\n\n');
}

app.post('/parse', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    const fileName = req.file.originalname || '';
    const fileType = resolveMimeType(req.file.mimetype, fileName);

    console.log(`Parsing file: ${fileName}, originalType: ${req.file.mimetype}, resolvedType: ${fileType}`);

    let text = '';

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
    // PPT 파일 파싱 (.pptx) - 슬라이드 XML에서 텍스트 추출
    else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
             fileType === 'application/vnd.ms-powerpoint') {
      try {
        text = extractTextFromPptx(filePath);
        if (!text || !text.trim()) {
          text = `[PPT 파일: ${fileName}]\n슬라이드에서 추출된 텍스트가 없습니다.`;
        }
      } catch (pptError) {
        console.error('PPTX parse error:', pptError);
        text = `[PPT 파일: ${fileName}]\nPPT 파싱 중 오류가 발생했습니다. PDF나 Word 형식으로 변환해 주세요.`;
      }
    }
    // 텍스트 파일 파싱 (.txt)
    else if (fileType === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
    }
    else {
      return res.status(400).json({ 
        error: `Unsupported file type: ${fileType}`,
        supportedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'text/plain']
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
