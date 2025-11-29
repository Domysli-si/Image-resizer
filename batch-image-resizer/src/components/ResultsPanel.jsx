// src/components/ResultsPanel.jsx

import { useState } from 'react';
import { createZipFile, downloadZip } from '../utils/fileUtils.js';

export default function ResultsPanel({ images }) {
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  
  const completedImages = images.filter(img => img.status === 'completed' && img.results);
  
  const handleDownloadAll = async () => {
    if (completedImages.length === 0) return;
    
    setIsCreatingZip(true);
    try {
      const zipBlob = await createZipFile(completedImages);
      downloadZip(zipBlob, 'resized-images.zip');
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      alert('Failed to create ZIP file');
    } finally {
      setIsCreatingZip(false);
    }
  };
  
  if (completedImages.length === 0) {
    return null;
  }
  
  return (
    <div className="results-panel">
      <div className="results-header">
        <h3>✅ Completed ({completedImages.length})</h3>
        <button
          onClick={handleDownloadAll}
          disabled={isCreatingZip}
          className="btn-download-all"
        >
          {isCreatingZip ? '📦 Creating ZIP...' : '⬇ Download All as ZIP'}
        </button>
      </div>
      
      <div className="results-info">
        All completed images will be organized in folders by original filename
      </div>
    </div>
  );
}
