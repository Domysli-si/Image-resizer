// src/core/ImageQueue.js

/**
 * Fronta pro zpracování obrázků
 * FIFO (First In First Out) - producent-konsument pattern
 */
export class ImageQueue {
  constructor() {
    this.queue = [];
    this.processing = new Set(); // ID obrázků, které se právě zpracovávají
  }
  
  /**
   * Přidá obrázek do fronty
   */
  enqueue(imageTask) {
    this.queue.push(imageTask);
  }
  
  /**
   * Odebere další obrázek z fronty (pokud je k dispozici)
   * @returns {Object|null} imageTask nebo null
   */
  dequeue() {
    if (this.queue.length === 0) {
      return null;
    }
    
    const task = this.queue.shift();
    this.processing.add(task.imageId);
    return task;
  }
  
  /**
   * Označí obrázek jako dokončený
   */
  markCompleted(imageId) {
    this.processing.delete(imageId);
  }
  
  /**
   * Vrátí obrázek zpět do fronty (při chybě workera)
   */
  requeueTask(task) {
    this.processing.delete(task.imageId);
    this.queue.unshift(task); // Dej ho na začátek fronty
  }
  
  /**
   * Kontroly stavu fronty
   */
  isEmpty() {
    return this.queue.length === 0;
  }
  
  hasWork() {
    return this.queue.length > 0;
  }
  
  size() {
    return this.queue.length;
  }
  
  processingCount() {
    return this.processing.size;
  }
  
  /**
   * Vymaže celou frontu (při resetu)
   */
  clear() {
    this.queue = [];
    this.processing.clear();
  }
}
