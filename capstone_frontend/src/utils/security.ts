/**
 * Security Utilities for CharityHub Frontend
 * Protects against XSS attacks and validates user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 * Use this for user-generated content from WYSIWYG editors
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
      'code', 'pre', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text (remove all HTML)
 * Use this for titles, names, and short text inputs
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove all HTML tags
  let cleaned = input.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = cleaned;
  cleaned = textarea.value;
  
  // Trim whitespace
  return cleaned.trim();
};

/**
 * Validate URL and check for dangerous protocols
 * Returns validated URL or null if invalid
 */
export const validateUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    // Try adding https:// if no protocol
    try {
      const withProtocol = new URL('https://' + url);
      return withProtocol.toString();
    } catch {
      return null;
    }
  }
};

/**
 * Check if URL is valid (returns boolean)
 */
export const isValidUrl = (url: string): boolean => {
  return validateUrl(url) !== null;
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Remove any non-email characters
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/gi, '');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Keep only numbers, spaces, +, -, (, )
  return phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();
};

/**
 * Check for potential XSS patterns
 * Returns true if suspicious content detected
 */
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize object recursively
 * Use before sending form data to backend
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Sanitize strings based on field name
      if (key.includes('description') || key.includes('content') || key.includes('message')) {
        sanitized[key] = sanitizeHtml(value);
      } else if (key.includes('url') || key.includes('website')) {
        sanitized[key] = validateUrl(value) || '';
      } else if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

/**
 * Safe HTML renderer component helper
 * Use: <div dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />
 */
export const safeHtml = (html: string): string => {
  return sanitizeHtml(html);
};

/**
 * Escape special characters for display
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize form data before submission
 */
export const sanitizeFormData = <T extends Record<string, any>>(formData: T): T => {
  return sanitizeObject(formData);
};
