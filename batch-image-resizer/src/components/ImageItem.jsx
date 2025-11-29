// src/components/ImageItem.jsx

import { formatFileSize } from '../utils/imageUtils.js';
import { downloadFile, createResizedFileName } from '../utils/fileUtils.js';

export default function ImageItem({ image }) {
  
  const handleDownload = (sizeName, blob) => {
    const fileName = createResizedFileName(image.originalName, sizeName);
    downloadFile(blob, fileName);
  };
  
  const getStatusIcon = () => {
    switch (image.status) {
      case 'queued': return '⏳';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };
  
  const getSizeStatus = (sizeName) => {
    if (image.status === 'completed') return '✓';
    if (image.completedSizes && image.completedSizes.includes(sizeName)) return '✓';
    if (image.status === 'processing') return '⏳';
    return '○';
  };
  
  return (
    <div className={`image-item ${image.status}`}>
      <div className="image-info">
        <span className="status-icon">{getStatusIcon()}</span>
        
        <div className="image-details">
          <div className="image-name">{image.originalName}</div>
          <div className="image-meta">
            {formatFileSize(image.file.size)} • {image.status}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {(image.status === 'processing' || image.status === 'queued') && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${image.progress || 0}%` }}
          />
        </div>
      )}
      
      {/* Size status */}
      <div className="size-status">
        <span className="size-badge">T {getSizeStatus('thumbnail')}</span>
        <span className="size-badge">M {getSizeStatus('medium')}</span>
        <span className="size-badge">L {getSizeStatus('large')}</span>
      </div>
      
      {/* Download buttons */}
      {image.status === 'completed' && image.results && (
        <div className="download-buttons">
          {Object.entries(image.results).map(([sizeName, blob]) => (
            <button
              key={sizeName}
              onClick={() => handleDownload(sizeName, blob)}
              className="btn-download"
              title={`Download ${sizeName}`}
            >
              ⬇ {sizeName[0].toUpperCase()}
            </button>
          ))}
        </div>
      )}
      
      {/* Error message */}
      {image.status === 'error' && (
        <div className="error-message">
          {image.error || 'Processing failed'}
        </div>
      )}
    </div>
  );
}
