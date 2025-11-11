import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Sanitize HTML content before rendering
 * Removes dangerous scripts and attributes while preserving safe HTML
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'src', 'alt', 'width', 'height', 'class'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};

/**
 * Strip all HTML tags - for plain text display
 */
export const stripHTML = (html: string): string => {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

/**
 * Sanitize user input before sending to backend
 * Removes dangerous patterns but preserves intended content
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  let sanitized = input;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^>]*>.*?<\/script>/gis, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized.trim();
};

/**
 * Validate URL is safe (no javascript: or data: protocols)
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  // Remove dangerous protocols
  const sanitized = url.replace(/^(javascript|data|vbscript):/i, '');
  
  // Validate URL format
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    return '';
  }
};

/**
 * Escape HTML entities for display in attributes
 */
export const escapeHTML = (text: string): string => {
  if (!text) return '';

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Check if content contains XSS patterns
 */
export const containsXSS = (content: string): boolean => {
  if (!content) return false;

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
  ];

  return xssPatterns.some(pattern => pattern.test(content));
};

/**
 * Safe component for rendering user-generated HTML
 * Usage: <SafeHTML html={userContent} />
 */
export const SafeHTML: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  const sanitized = sanitizeHTML(html);
  return React.createElement('div', {
    className,
    dangerouslySetInnerHTML: { __html: sanitized },
  });
};
