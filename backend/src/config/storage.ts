import fs from 'fs';
import path from 'path';
import { logger } from '@utils/logger';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export const STORAGE_PATHS = {
  reports: path.join(UPLOAD_DIR, 'relatos'),
  temp: path.join(UPLOAD_DIR, 'temp'),
  quarantine: path.join(UPLOAD_DIR, 'quarantine')
};

export const FILE_LIMITS = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  maxFiles: 10,
  maxTotalSize: 100 * 1024 * 1024 // 100MB
};

// Tipos MIME permitidos
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/x.opus',
];

// Extensões permitidas
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.doc',
  '.docx',
  '.mp4',
  '.mp3',
  '.ogg',
  '.wav',
  '.webm',
  '.opus',
];

// Gerar nome único para arquivo
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

export function initStorage() {
  Object.values(STORAGE_PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Diretório criado: ${dir}`);
    }
  });
}