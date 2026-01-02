import crypto from 'crypto';
import { nanoid } from 'nanoid';

/**
 * Gera um hash SHA-256 de uma string
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Gera um token seguro aleatório
 * @param length - comprimento do token (padrão: 32 bytes = 64 caracteres hex)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera um token mais curto e URL-safe usando nanoid
 * @param length - comprimento do token (padrão: 21)
 */
export function generateShortToken(length: number = 21): string {
  return nanoid(length);
}

/**
 * Gera um hash para verificação de arquivo
 */
export async function generateFileHash(buffer: Buffer): Promise<string> {
  return sha256(buffer.toString('base64'));
}

/**
 * Timing-safe string comparison para prevenir timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Ainda faz a comparação para evitar timing attacks
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/**
 * Gera um device fingerprint a partir do user agent
 */
export function generateDeviceFingerprint(userAgent: string, ip: string): string {
  const data = `${userAgent}|${ip}`;
  return sha256(data).substring(0, 16);
}

/**
 * Mascara um email para exibição segura
 * ex: joao.silva@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const maskedLocal = local[0] + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Mascara um telefone para exibição segura
 * ex: (11) 98765-4321 -> (11) ****-4321
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';

  const last4 = cleaned.slice(-4);
  const prefix = cleaned.slice(0, -4).replace(/./g, '*');
  
  return phone.replace(cleaned, prefix + last4);
}

/**
 * Gera um código numérico de verificação
 * @param length - número de dígitos (padrão: 6)
 */
export function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    code += digits[randomIndex];
  }
  
  return code;
}

/**
 * Criptografa dados sensíveis (AES-256-GCM)
 */
export function encrypt(text: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa dados sensíveis (AES-256-GCM)
 */
export function decrypt(encryptedText: string, key: string): string {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);

  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}



