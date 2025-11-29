// src/workers/image-worker.js

/**
 * Web Worker pro změnu velikosti obrázků
 * Každý worker zpracovává celý obrázek (všechny 3 velikosti)
 */

self.onmessage = async function(e) {
  const { type, payload } = e.data;
  
  if (type === 'RESIZE_IMAGE') {
    try {
      // Začínáme zpracování
      self.postMessage({
        type: 'PROGRESS',
        payload: {
          imageId: payload.imageId,
          progress: 0,
          status: 'processing'
        }
      });

      // Zpracuj všechny 3 velikosti
      const results = {};
      const sizes = ['thumbnail', 'medium', 'large'];
      
      for (let i = 0; i < sizes.length; i++) {
        const sizeName = sizes[i];
        const sizeConfig = payload.sizes[sizeName];
        
        // Resize obrázek
        const resizedBlob = await resizeImage(
          payload.imageBlob,
          sizeConfig.width,
          sizeConfig.height,
          sizeConfig.mode,
          payload.quality
        );
        
        results[sizeName] = resizedBlob;
        
        // Update progress (každá velikost = 33%)
        const progress = Math.round(((i + 1) / sizes.length) * 100);
        self.postMessage({
          type: 'PROGRESS',
          payload: {
            imageId: payload.imageId,
            progress: progress,
            completedSize: sizeName
          }
        });
      }
      
      // Hotovo!
      self.postMessage({
        type: 'COMPLETED',
        payload: {
          imageId: payload.imageId,
          results: results,
          originalName: payload.originalName
        }
      });
      
    } catch (error) {
      // Chyba při zpracování
      self.postMessage({
        type: 'ERROR',
        payload: {
          imageId: payload.imageId,
          error: error.message
        }
      });
    }
  }
};

/**
 * Změna velikosti obrázku pomocí Canvas API
 */
async function resizeImage(blob, targetWidth, targetHeight, mode, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
      try {
        // Vypočítej rozměry podle módu
        const dimensions = calculateDimensions(
          img.width,
          img.height,
          targetWidth,
          targetHeight,
          mode
        );
        
        // Vytvoř canvas
        const canvas = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = canvas.getContext('2d');
        
        // Vyplň pozadí bílou (pro transparentní obrázky)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Nakresli obrázek
        ctx.drawImage(
          img,
          dimensions.sx,
          dimensions.sy,
          dimensions.sWidth,
          dimensions.sHeight,
          dimensions.dx,
          dimensions.dy,
          dimensions.dWidth,
          dimensions.dHeight
        );
        
        // Konvertuj na Blob (JPEG)
        canvas.convertToBlob({
          type: 'image/jpeg',
          quality: quality
        }).then(resizedBlob => {
          URL.revokeObjectURL(url);
          resolve(resizedBlob);
        });
        
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    img.onerror = function() {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Vypočítá rozměry a pozice pro drawImage podle módu
 */
function calculateDimensions(srcWidth, srcHeight, targetWidth, targetHeight, mode) {
  const srcRatio = srcWidth / srcHeight;
  const targetRatio = targetWidth / targetHeight;
  
  let sx = 0, sy = 0, sWidth = srcWidth, sHeight = srcHeight;
  let dx = 0, dy = 0, dWidth = targetWidth, dHeight = targetHeight;
  
  if (mode === 'cover') {
    // Vyplní celou plochu, může ořezat
    if (srcRatio > targetRatio) {
      // Širší než target - ořež strany
      sWidth = srcHeight * targetRatio;
      sx = (srcWidth - sWidth) / 2;
    } else {
      // Užší než target - ořež vrch/spodek
      sHeight = srcWidth / targetRatio;
      sy = (srcHeight - sHeight) / 2;
    }
  } else if (mode === 'contain') {
    // Vejde se celý obrázek, může mít prázdné místo
    if (srcRatio > targetRatio) {
      // Širší - zmenši výšku
      dHeight = targetWidth / srcRatio;
      dy = (targetHeight - dHeight) / 2;
    } else {
      // Užší - zmenši šířku
      dWidth = targetHeight * srcRatio;
      dx = (targetWidth - dWidth) / 2;
    }
  }
  
  return { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight };
}

// Pošli potvrzení, že worker je připravený
self.postMessage({ type: 'READY' });
