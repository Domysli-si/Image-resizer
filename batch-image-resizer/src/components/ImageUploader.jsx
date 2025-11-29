// src/components/ImageUploader.jsx

import { useState } from 'react';

export default function ImageUploader({ onFilesSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };
  
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
    e.target.value = ''; // Reset input
  };
  
  return (
    <div
      className={`uploader ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="uploader-content">
        <span className="upload-icon">📁</span>
        <p className="upload-text">
          Drag & drop images here or click to select
        </p>
        <p className="upload-hint">
          Max 10 images, 5MB each (JPEG, PNG, WebP)
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          disabled={disabled}
          className="file-input"
        />
      </div>
    </div>
  );
}
