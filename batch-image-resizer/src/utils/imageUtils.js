// src/utils/imageUtils.js

import { MAX_FILE_SIZE, ALLOWED_TYPES } from '../core/constants.js';

/**
 * Validace obrázku
 */
export function validateImage(file) {
  const errors = [];
  
  // Kontrola typu
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }
  
  // Kontrola velikosti
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large: ${formatFileSize(file.size)}. Max: ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validace pole obrázků
 */
export function validateImages(files, currentCount = 0) {
  const errors = [];
  const validFiles = [];
  
  // Kontrola počtu
  if (files.length + currentCount > 10) {
    errors.push(`Too many files. Maximum is 10 images.`);
    return { valid: false, errors, validFiles };
  }
  
  // Validace každého souboru
  files.forEach(file => {
    const validation = validateImage(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    valid: validFiles.length > 0,
    errors: errors,
    validFiles: validFiles
  };
}

/**
 * Formátování velikosti souboru
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generování unikátního ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Vytvoření preview URL z File objektu
 */
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Uvolnění preview URL
 */
export function revokePreviewUrl(url) {
  URL.revokeObjectURL(url);
}
