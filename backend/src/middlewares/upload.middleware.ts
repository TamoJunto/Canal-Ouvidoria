import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { STORAGE_PATHS, FILE_LIMITS, generateUniqueFilename } from '../config/storage';
import { validateFileExtension } from '../utils/file-validator';
import { AppError } from './error-handler';

// Configuração de storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_PATHS.temp);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  },
});

// Filtro de arquivos (validação inicial por extensão)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (validateFileExtension(file.originalname)) {
    cb(null, true);
  } else {
    const ext = path.extname(file.originalname);
    cb(new AppError(`Extensão não permitida: ${ext}`, 400));
  }
};

// Configuração do Multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.maxFileSize,
    files: FILE_LIMITS.maxFiles,
  },
});

// Handler para múltiplos arquivos
export const uploadMultiple = uploadMiddleware.array('files', FILE_LIMITS.maxFiles);

// Handler para arquivo único
export const uploadSingle = uploadMiddleware.single('file');