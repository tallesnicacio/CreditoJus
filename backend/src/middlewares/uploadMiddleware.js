/**
 * Middleware para upload de arquivos
 * Configura o multer para processamento de uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Criar diretório de uploads se não existir
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  
  // Criar subdiretórios para diferentes tipos de arquivo
  const subdirs = ['processos', 'transacoes', 'usuarios'];
  subdirs.forEach(dir => {
    const fullPath = path.join(uploadDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar diretório baseado na rota
    let dir = uploadDir;
    
    if (req.path.includes('/processos')) {
      dir = path.join(uploadDir, 'processos');
    } else if (req.path.includes('/transacoes')) {
      dir = path.join(uploadDir, 'transacoes');
    } else if (req.path.includes('/usuarios')) {
      dir = path.join(uploadDir, 'usuarios');
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const fileExt = path.extname(file.originalname);
    const filename = `${timestamp}-${hash}${fileExt}`;
    
    cb(null, filename);
  }
});

// Filtro para validar tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Permitidos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;