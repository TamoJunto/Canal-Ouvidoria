import { fileTypeFromBuffer } from 'file-type';
import sanitize from 'sanitize-filename';
import path from 'path';
import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } from '@config/storage';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
  detectedMime?: string;
}

/**
 * Valida o tipo MIME real do arquivo (não confia apenas na extensão)
 */
export async function validateFileMimeType(
  buffer: Buffer,
  originalName: string
): Promise<FileValidationResult> {
  try {
    // Detectar tipo MIME real
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      return {
        isValid: false,
        error: 'Não foi possível detectar o tipo do arquivo',
      };
    }

    // Verificar se o MIME está na lista permitida
    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return {
        isValid: false,
        error: `Tipo de arquivo não permitido: ${fileType.mime}`,
      };
    }

    // Sanitizar nome do arquivo
    const sanitizedName = sanitize(originalName);

    return {
      isValid: true,
      sanitizedName,
      detectedMime: fileType.mime,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao validar arquivo',
    };
  }
}

/**
 * Valida extensão do arquivo (validação rápida antes do upload)
 */
export function validateFileExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Valida tamanho do arquivo
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Sanitiza nome de arquivo removendo caracteres perigosos
 */
export function sanitizeFilename(filename: string): string {
  return sanitize(filename, { replacement: '_' });
}