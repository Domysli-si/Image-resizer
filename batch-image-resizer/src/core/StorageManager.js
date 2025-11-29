// src/core/StorageManager.js

import { STORAGE_KEYS, DEFAULT_SIZES, JPEG_QUALITY } from './constants.js';

/**
 * Správa localStorage - ukládání nastavení
 */
export class StorageManager {
  
  /**
   * Uloží velikosti obrázků
   */
  static saveSizes(sizes) {
    try {
      localStorage.setItem(STORAGE_KEYS.SIZES, JSON.stringify(sizes));
      return true;
    } catch (error) {
      console.error('Failed to save sizes:', error);
      return false;
    }
  }
  
  /**
   * Načte velikosti obrázků
   */
  static loadSizes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SIZES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sizes:', error);
    }
    
    // Vrať výchozí hodnoty
    return DEFAULT_SIZES;
  }
  
  /**
   * Uloží další nastavení (kvalita, max concurrent, atd.)
   */
  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }
  
  /**
   * Načte nastavení
   */
  static loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    // Vrať výchozí hodnoty
    return {
      quality: JPEG_QUALITY,
      maxConcurrent: 2
    };
  }
  
  /**
   * Reset na výchozí hodnoty
   */
  static reset() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SIZES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return true;
    } catch (error) {
      console.error('Failed to reset storage:', error);
      return false;
    }
  }
}
