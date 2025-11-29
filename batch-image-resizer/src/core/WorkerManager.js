// src/core/WorkerManager.js

import { WORKER_COUNT, WORKER_STATUS } from './constants.js';
import { ImageQueue } from './ImageQueue.js';

/**
 * Správce Web Workers - řídí paralelní zpracování obrázků
 * Koordinuje 3 workers a frontu úloh
 */
export class WorkerManager {
  constructor(onProgress, onComplete, onError) {
    this.workers = [];
    this.workerStates = [];
    this.queue = new ImageQueue();
    this.maxConcurrent = 2; // Max 2 obrázky současně (resource limiting)
    
    // Callbacks pro komunikaci s UI
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;
  }
  
  /**
   * Inicializace workers
   */
  async initialize() {
    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = new Worker(
        new URL('../workers/image-worker.js', import.meta.url),
        { type: 'module' }
      );
      
      // Nastavení message handleru
      worker.onmessage = (e) => this.handleWorkerMessage(i, e);
      worker.onerror = (e) => this.handleWorkerError(i, e);
      
      this.workers.push(worker);
      this.workerStates.push({
        id: i,
        status: WORKER_STATUS.IDLE,
        currentTask: null
      });
    }
    
    console.log(`✓ ${WORKER_COUNT} workers initialized`);
  }
  
  /**
   * Přidá obrázek do fronty a spustí zpracování
   */
  addImage(imageTask) {
    this.queue.enqueue(imageTask);
    this.distributeWork();
  }
  
  /**
   * Distribuuje práci mezi volné workery
   * KLÍČOVÁ METODA - zde se děje koordinace!
   */
  distributeWork() {
    // Kontrola resource limitu (max 2 současně)
    const processingCount = this.queue.processingCount();
    if (processingCount >= this.maxConcurrent) {
      console.log(`⚠ Resource limit: ${processingCount}/${this.maxConcurrent} processing`);
      return;
    }
    
    // Najdi volné workery
    for (let i = 0; i < this.workers.length; i++) {
      if (this.workerStates[i].status === WORKER_STATUS.IDLE && this.queue.hasWork()) {
        // Vezmi další úlohu z fronty
        const task = this.queue.dequeue();
        
        if (task) {
          // Přiřaď workerovi
          this.assignTaskToWorker(i, task);
          
          // Zkontroluj jestli už nedosahujeme limitu
          if (this.queue.processingCount() >= this.maxConcurrent) {
            break;
          }
        }
      }
    }
  }
  
  /**
   * Přiřadí úlohu konkrétnímu workerovi
   */
  assignTaskToWorker(workerId, task) {
    this.workerStates[workerId].status = WORKER_STATUS.BUSY;
    this.workerStates[workerId].currentTask = task.imageId;
    
    console.log(`→ Worker ${workerId} processing: ${task.originalName}`);
    
    // Pošli úlohu workerovi
    this.workers[workerId].postMessage({
      type: 'RESIZE_IMAGE',
      payload: task
    });
  }
  
  /**
   * Zpracování zpráv od workers
   */
  handleWorkerMessage(workerId, event) {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'READY':
        console.log(`✓ Worker ${workerId} ready`);
        break;
        
      case 'PROGRESS':
        // Progress update pro UI
        if (this.onProgress) {
          this.onProgress(payload);
        }
        break;
        
      case 'COMPLETED':
        // Obrázek dokončen
        console.log(`✓ Worker ${workerId} completed: ${payload.originalName}`);
        
        // Označ jako dokončeno
        this.queue.markCompleted(payload.imageId);
        
        // Uvolni workera
        this.workerStates[workerId].status = WORKER_STATUS.IDLE;
        this.workerStates[workerId].currentTask = null;
        
        // Callback pro UI
        if (this.onComplete) {
          this.onComplete(payload);
        }
        
        // Distribuuj další práci
        this.distributeWork();
        break;
        
      case 'ERROR':
        // Chyba při zpracování
        console.error(`✗ Worker ${workerId} error:`, payload.error);
        
        // Označ jako dokončeno (s chybou)
        this.queue.markCompleted(payload.imageId);
        
        // Uvolni workera
        this.workerStates[workerId].status = WORKER_STATUS.IDLE;
        this.workerStates[workerId].currentTask = null;
        
        // Callback pro UI
        if (this.onError) {
          this.onError(payload);
        }
        
        // Distribuuj další práci
        this.distributeWork();
        break;
    }
  }
  
  /**
   * Ošetření chyb workera
   */
  handleWorkerError(workerId, error) {
    console.error(`✗ Worker ${workerId} crashed:`, error);
    
    const currentTask = this.workerStates[workerId].currentTask;
    
    // Pokud měl worker nějakou úlohu, vrať ji do fronty
    if (currentTask) {
      const task = {
        imageId: currentTask,
        // ... další data úlohy (ideálně by se měla uložit celá)
      };
      this.queue.requeueTask(task);
    }
    
    // Označ workera jako idle (nebo by se mohl restartovat)
    this.workerStates[workerId].status = WORKER_STATUS.IDLE;
    this.workerStates[workerId].currentTask = null;
    
    // Zkus distribuovat práci jiným workerům
    this.distributeWork();
  }
  
  /**
   * Získání stavu všech workers (pro UI)
   */
  getWorkerStates() {
    return this.workerStates.map(state => ({...state}));
  }
  
  /**
   * Statistiky fronty
   */
  getQueueStats() {
    return {
      waiting: this.queue.size(),
      processing: this.queue.processingCount(),
      total: this.queue.size() + this.queue.processingCount()
    };
  }
  
  /**
   * Ukončení všech workers (cleanup)
   */
  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerStates = [];
    this.queue.clear();
    console.log('✓ All workers terminated');
  }
}
