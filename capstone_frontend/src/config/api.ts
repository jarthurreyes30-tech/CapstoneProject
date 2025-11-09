/**
 * API Configuration
 * Centralized configuration for API endpoints and URLs
 */

// Base API URL for API endpoints (includes /api)
export const API_URL = import.meta.env.VITE_API_URL;

// Base URL for the backend server (without /api)
export const BASE_URL = API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

// Storage URL for accessing uploaded files
export const STORAGE_URL = `${BASE_URL}/storage`;

/**
 * Helper function to get the full storage URL for a file path
 * @param path - The file path from the database (e.g., "images/abc123.jpg")
 * @returns Full URL to access the file
 */
export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${STORAGE_URL}/${path}`;
}

/**
 * Helper function to get image URL with fallback
 * @param path - The file path from the database
 * @param fallback - Fallback URL if path is null/undefined
 * @returns Image URL or fallback
 */
export function getImageUrl(path: string | null | undefined, fallback?: string): string {
  return getStorageUrl(path) || fallback || '';
}
