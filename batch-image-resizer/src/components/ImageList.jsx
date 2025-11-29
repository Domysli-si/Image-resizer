// src/components/ImageList.jsx

import ImageItem from './ImageItem.jsx';

export default function ImageList({ images, onClear }) {
  
  if (images.length === 0) {
    return (
      <div className="empty-state">
        <p>No images uploaded yet</p>
      </div>
    );
  }
  
  const stats = {
    total: images.length,
    completed: images.filter(img => img.status === 'completed').length,
    processing: images.filter(img => img.status === 'processing').length,
    queued: images.filter(img => img.status === 'queued').length,
    errors: images.filter(img => img.status === 'error').length
  };
  
  return (
    <div className="image-list-container">
      <div className="list-header">
        <h3>Images ({stats.total})</h3>
        <div className="stats">
          <span className="stat">✅ {stats.completed}</span>
          <span className="stat">⚙️ {stats.processing}</span>
          <span className="stat">⏳ {stats.queued}</span>
          {stats.errors > 0 && <span className="stat error">❌ {stats.errors}</span>}
        </div>
        <button onClick={onClear} className="btn-clear">
          Clear All
        </button>
      </div>
      
      <div className="image-list">
        {images.map(image => (
          <ImageItem key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
}
