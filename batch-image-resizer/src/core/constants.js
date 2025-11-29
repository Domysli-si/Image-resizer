// src/core/constants.js

// Limity aplikace
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB v bytech

// Počet workers
export const WORKER_COUNT = 3;

// Výchozí velikosti obrázků (konfigurovatelné)
export const DEFAULT_SIZES = {
  thumbnail: { width: 150, height: 150, mode: 'cover' },
  medium: { width: 800, height: 600, mode: 'contain' },
  large: { width: 1920, height: 1080, mode: 'contain' }
};

// Kvalita JPEG výstupu (0-1)
export const JPEG_QUALITY = 0.85;

// Povolené typy souborů
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Stavy zpracování obrázku
export const IMAGE_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Stavy workera
export const WORKER_STATUS = {
  IDLE: 'idle',
  BUSY: 'busy',
  ERROR: 'error'
};

// LocalStorage klíče
export const STORAGE_KEYS = {
  SIZES: 'image_resizer_sizes',
  SETTINGS: 'image_resizer_settings'
};
