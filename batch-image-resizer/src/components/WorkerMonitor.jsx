// src/components/WorkerMonitor.jsx

export default function WorkerMonitor({ workerStates, queueStats }) {
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle': return '○';
      case 'busy': return '●';
      case 'error': return '✗';
      default: return '?';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'idle': return 'idle';
      case 'busy': return 'busy';
      case 'error': return 'error';
      default: return '';
    }
  };
  
  return (
    <div className="worker-monitor">
      <h3>Workers Status</h3>
      
      <div className="workers-grid">
        {workerStates.map(worker => (
          <div key={worker.id} className={`worker-card ${getStatusClass(worker.status)}`}>
            <div className="worker-header">
              <span className="worker-icon">{getStatusIcon(worker.status)}</span>
              <span className="worker-id">Worker {worker.id + 1}</span>
            </div>
            <div className="worker-status">
              {worker.status}
              {worker.currentTask && (
                <div className="current-task">
                  Processing: {worker.currentTask}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {queueStats && (
        <div className="queue-stats">
          <div className="stat-item">
            <span className="stat-label">Queue:</span>
            <span className="stat-value">{queueStats.waiting}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Processing:</span>
            <span className="stat-value">{queueStats.processing}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{queueStats.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
