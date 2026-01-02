/**
 * Gerador de protocolos únicos para relatos
 * Formato: AAAA-XXXXXX (ex: 2025-ABC123)
 * 
 * Usa caracteres sem ambiguidade: sem I, O, 0, 1
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PROTOCOL_LENGTH = 6;

/**
 * Gera um protocolo único no formato AAAA-XXXXXX
 */
export function generateProtocol(): string {
  const year = new Date().getFullYear().toString();
  const randomPart = generateRandomString(PROTOCOL_LENGTH);
  
  return `${year}-${randomPart}`;
}

/**
 * Gera uma string aleatória usando os caracteres permitidos
 */
function generateRandomString(length: number): string {
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARS.length);
    result += CHARS[randomIndex];
  }
  
  return result;
}

/**
 * Valida o formato de um protocolo
 */
export function isValidProtocol(protocol: string): boolean {
  // Formato: AAAA-XXXXXX
  const regex = /^\d{4}-[A-Z2-9]{6}$/;
  
  if (!regex.test(protocol)) {
    return false;
  }

  // Verifica se não contém caracteres ambíguos
  const code = protocol.split('-')[1];
  const ambiguousChars = ['I', 'O', '0', '1'];
  
  return !ambiguousChars.some(char => code.includes(char));
}

/**
 * Normaliza um protocolo (remove espaços, converte para maiúsculas)
 */
export function normalizeProtocol(protocol: string): string {
  return protocol.trim().toUpperCase();
}

/**
 * Extrai o ano de um protocolo
 */
export function getProtocolYear(protocol: string): number | null {
  const match = protocol.match(/^(\d{4})-/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Verifica se um protocolo é do ano atual
 */
export function isCurrentYearProtocol(protocol: string): boolean {
  const year = getProtocolYear(protocol);
  return year === new Date().getFullYear();
}

/**
 * Gera múltiplos protocolos únicos (útil para testes)
 */
export function generateMultipleProtocols(count: number): string[] {
  const protocols = new Set<string>();
  
  while (protocols.size < count) {
    protocols.add(generateProtocol());
  }
  
  return Array.from(protocols);
}



