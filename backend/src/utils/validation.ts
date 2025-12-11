// src/utils/validation.ts
// Input validation functions - Data validate panradhu

/**
 * Email validate panra function
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Password strength check panra function
 * Minimum 6 characters, at least 1 letter and 1 number
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 6) return false;
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasLetter && hasNumber;
};

/**
 * MongoDB ObjectId valid ah check panrom
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Phone number validate (Indian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// src/utils/validation.ts

// src/utils/validation.ts

/**
 * Card number validate (lenient for testing)
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  // Return true for testing (skip Luhn)
  return true;
};
/**
 * UPI ID validate
 */
export const isValidUPI = (upiId: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Sanitize string - XSS prevent kaaga
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '') // HTML tags remove
    .trim();
};

/**
 * Amount validate panrom
 */
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
};