// src/App.jsx

import { useState, useEffect, useRef } from 'react';
import './App.css';

import ImageUploader from './components/ImageUploader.jsx';
import ImageList from './components/ImageList.jsx';
import WorkerMonitor from './components/WorkerMonitor.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';

import { WorkerManager } from './core/WorkerManager.js';
import { StorageManager } from './core/StorageManager.js';
import { validateImages, generateId } from './utils/imageUtils.js';
import { MAX_FILES, IMAGE_STATUS, JPEG_QUALITY } from './core/constants.js';

function App() {
  const [images, setImages] = useState([]);
  const [workerStates, setWorkerStates] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [sizes, setSizes] = useState(() => StorageManager.loadSizes());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const workerManagerRef = useRef(null);
  
  // Inicializace WorkerManager při mount
  useEffect(() => {
    const manager = new WorkerManager(
      handleProgress,
      handleComplete,
      handleError
    );
    
    manager.initialize().then(() => {
      workerManagerRef.current = manager;
      updateWorkerStates();
    });
    
    // Cleanup při unmount
    return () => {
      if (workerManagerRef.current) {
        workerManagerRef.current.terminate();
      }
    };
  }, []);
  
  // Update worker states každou sekundu
  useEffect(() => {
    const interval = setInterval(() => {
      updateWorkerStates();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updateWorkerStates = () => {
    if (workerManagerRef.current) {
      setWorkerStates(workerManagerRef.current.getWorkerStates());
      setQueueStats(workerManagerRef.current.getQueueStats());
    }
  };
  
  // Handler pro výběr souborů
  const handleFilesSelected = (files) => {
    const validation = validateImages(files, images.length);
    
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      if (validation.validFiles.length === 0) return;
    }
    
    // Vytvoř objekty pro nové obrázky
    const newImages = validation.validFiles.map(file => ({
      id: generateId(),
      file: file,
      originalName: file.name,
      status: IMAGE_STATUS.QUEUED,
      progress: 0,
      completedSizes: [],
      results: null,
      error: null
    }));
    
    setImages(prev => [...prev, ...newImages]);
    
    // Přidej do fronty pro zpracování
    if (workerManagerRef.current) {
      newImages.forEach(image => {
        const task = {
          imageId: image.id,
          imageBlob: image.file,
          originalName: image.originalName,
          sizes: sizes,
          quality: JPEG_QUALITY
        };
        workerManagerRef.current.addImage(task);
      });
      
      setIsProcessing(true);
    }
  };
  
  // Handler pro progress update
  const handleProgress = (payload) => {
    setImages(prev => prev.map(img => {
      if (img.id === payload.imageId) {
        const updates = {
          status: payload.status || IMAGE_STATUS.PROCESSING,
          progress: payload.progress || img.progress
        };
        
        if (payload.completedSize) {
          updates.completedSizes = [...(img.completedSizes || []), payload.completedSize];
        }
        
        return { ...img, ...updates };
      }
      return img;
    }));
    
    updateWorkerStates();
  };
  
  // Handler pro dokončení zpracování
  const handleComplete = (payload) => {
    setImages(prev => prev.map(img => {
      if (img.id === payload.imageId) {
        return {
          ...img,
          status: IMAGE_STATUS.COMPLETED,
          progress: 100,
          results: payload.results
        };
      }
      return img;
    }));
    
    updateWorkerStates();
    checkIfAllCompleted();
  };
  
  // Handler pro chybu
  const handleError = (payload) => {
    setImages(prev => prev.map(img => {
      if (img.id === payload.imageId) {
        return {
          ...img,
          status: IMAGE_STATUS.ERROR,
          error: payload.error
        };
      }
      return img;
    }));
    
    updateWorkerStates();
    checkIfAllCompleted();
  };
  
  // Kontrola jestli jsou všechny obrázky hotové
  const checkIfAllCompleted = () => {
    setImages(current => {
      const allDone = current.every(img => 
        img.status === IMAGE_STATUS.COMPLETED || 
        img.status === IMAGE_STATUS.ERROR
      );
      
      if (allDone && current.length > 0) {
        setIsProcessing(false);
      }
      
      return current;
    });
  };
  
  // Handler pro změnu velikostí
  const handleSizesChange = (newSizes) => {
    setSizes(newSizes);
    StorageManager.saveSizes(newSizes);
  };
  
  // Handler pro reset na výchozí
  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      StorageManager.reset();
      setSizes(StorageManager.loadSizes());
    }
  };
  
  // Handler pro vyčištění seznamu
  const handleClear = () => {
    if (isProcessing) {
      if (!confirm('Processing is in progress. Clear anyway?')) {
        return;
      }
    }
    
    setImages([]);
    setIsProcessing(false);
    
    // Vyčisti frontu
    if (workerManagerRef.current) {
      workerManagerRef.current.queue.clear();
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>🖼️ Batch Image Resizer</h1>
        <p>Resize multiple images in parallel using Web Workers</p>
      </header>
      
      <main className="app-main">
        <div className="upload-section">
          <ImageUploader
            onFilesSelected={handleFilesSelected}
            disabled={images.length >= MAX_FILES || isProcessing}
          />
        </div>
        
        <ConfigPanel
          sizes={sizes}
          onSizesChange={handleSizesChange}
          onReset={handleReset}
        />
        
        <WorkerMonitor
          workerStates={workerStates}
          queueStats={queueStats}
        />
        
        <ResultsPanel images={images} />
        
        <ImageList
          images={images}
          onClear={handleClear}
        />
      </main>
      
      <footer className="app-footer">
        <p>Created by Samuel Majer • School Project • 2025</p>
      </footer>
    </div>
  );
}

export default App;
