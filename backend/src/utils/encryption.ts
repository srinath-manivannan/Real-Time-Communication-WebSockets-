// src/utils/encryption.ts
// AES-256 encryption/decryption functions - Messages and sensitive data encrypt/decrypt panradhu

import crypto from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-cbc';

// Get keys from environment variables with proper validation
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 characters
const IV_KEY = process.env.ENCRYPTION_IV || '1234567890123456'; // Must be 16 characters

// Validate key lengths
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
}

if (IV_KEY.length !== 16) {
  throw new Error('ENCRYPTION_IV must be exactly 16 characters');
}

/**
 * Text a encrypt panra function
 * @param text - Plain text (encrypt panna vendiya text)
 * @returns Encrypted string (Base64 encoded)
 */
export const encrypt = (text: string): string => {
  try {
    if (!text) return '';
    
    // Key and IV buffer a convert panrom
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const iv = Buffer.from(IV_KEY, 'utf-8');
    
    // Cipher create panrom
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Text a encrypt panrom
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption Error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Encrypted text a decrypt panra function
 * @param encryptedText - Encrypted text (Base64 encoded)
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedText: string): string => {
  try {
    if (!encryptedText) return '';
    
    // Key and IV buffer a convert panrom
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const iv = Buffer.from(IV_KEY, 'utf-8');
    
    // Decipher create panrom
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Text a decrypt panrom
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption Error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash generate panra function (passwords kaaga)
 * @param data - Hash panna vendiya data
 * @returns SHA-256 hash
 */
export const generateHash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Random token generate panra function
 * @param length - Token length (default: 32)
 * @returns Random hex token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * Secure random string generate (alphanumeric)
 * @param length - String length
 * @returns Random alphanumeric string
 */
export const generateSecureRandomString = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  
  return result;
};

/**
 * Generate UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * HMAC signature generate panrom
 * @param data - Sign panna vendiya data
 * @param secret - Secret key
 * @returns HMAC signature
 */
export const generateHMAC = (data: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
};

/**
 * Verify HMAC signature
 * @param data - Original data
 * @param signature - HMAC signature
 * @param secret - Secret key
 * @returns Boolean - Valid or not
 */
export const verifyHMAC = (data: string, signature: string, secret: string): boolean => {
  const expectedSignature = generateHMAC(data, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

/**
 * File encryption (for binary data)
 * @param buffer - File buffer
 * @returns Encrypted buffer
 */
export const encryptBuffer = (buffer: Buffer): Buffer => {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const iv = Buffer.from(IV_KEY, 'utf-8');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
  } catch (error) {
    console.error('❌ Buffer Encryption Error:', error);
    throw new Error('Failed to encrypt buffer');
  }
};

/**
 * File decryption (for binary data)
 * @param encryptedBuffer - Encrypted buffer
 * @returns Decrypted buffer
 */
export const decryptBuffer = (encryptedBuffer: Buffer): Buffer => {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const iv = Buffer.from(IV_KEY, 'utf-8');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  } catch (error) {
    console.error('❌ Buffer Decryption Error:', error);
    throw new Error('Failed to decrypt buffer');
  }
};

/**
 * Password strength checker
 * @param password - Password string
 * @returns Strength score (0-4)
 */
export const checkPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

/**
 * Mask sensitive data (for logging)
 * @param data - Sensitive data
 * @param visibleChars - Number of visible characters (default: 4)
 * @returns Masked string
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) return '****';
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.max(data.length - visibleChars, 4));
  
  return masked + visible;
};

/**
 * Compare two strings in constant time (timing attack prevent kaaga)
 * @param a - First string
 * @param b - Second string
 * @returns Boolean
 */
export const constantTimeCompare = (a: string, b: string): boolean => {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  } catch {
    return false;
  }
};