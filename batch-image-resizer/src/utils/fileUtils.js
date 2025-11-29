// src/utils/fileUtils.js

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Vytvoření ZIP souboru se všemi obrázky
 */
export async function createZipFile(images) {
  const zip = new JSZip();
  
  // Projdi všechny obrázky
  for (const image of images) {
    if (!image.results) continue;
    
    // Vytvoř složku pro každý obrázek
    const baseName = image.originalName.replace(/\.[^/.]+$/, ''); // Odstraň příponu
    const folder = zip.folder(baseName);
    
    // Přidej všechny velikosti
    for (const [sizeName, blob] of Object.entries(image.results)) {
      const fileName = `${sizeName}.jpg`;
      folder.file(fileName, blob);
    }
  }
  
  // Generuj ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

/**
 * Stažení ZIP souboru
 */
export function downloadZip(zipBlob, fileName = 'resized-images.zip') {
  saveAs(zipBlob, fileName);
}

/**
 * Stažení jednotlivého souboru
 */
export function downloadFile(blob, fileName) {
  saveAs(blob, fileName);
}

/**
 * Vytvoření názvu souboru pro resize
 */
export function createResizedFileName(originalName, sizeName) {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_${sizeName}.jpg`;
}
