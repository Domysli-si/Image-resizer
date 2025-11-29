// src/components/ConfigPanel.jsx

import { useState } from 'react';

export default function ConfigPanel({ sizes, onSizesChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSizeChange = (sizeName, dimension, value) => {
    const newSizes = {
      ...sizes,
      [sizeName]: {
        ...sizes[sizeName],
        [dimension]: parseInt(value) || 0
      }
    };
    onSizesChange(newSizes);
  };
  
  const handleModeChange = (sizeName, mode) => {
    const newSizes = {
      ...sizes,
      [sizeName]: {
        ...sizes[sizeName],
        mode: mode
      }
    };
    onSizesChange(newSizes);
  };
  
  return (
    <div className="config-panel">
      <div className="config-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>⚙️ Configuration</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div className="config-content">
          {Object.entries(sizes).map(([sizeName, config]) => (
            <div key={sizeName} className="size-config">
              <h4>{sizeName.charAt(0).toUpperCase() + sizeName.slice(1)}</h4>
              
              <div className="config-row">
                <label>
                  Width:
                  <input
                    type="number"
                    value={config.width}
                    onChange={(e) => handleSizeChange(sizeName, 'width', e.target.value)}
                    min="10"
                    max="4000"
                  />
                </label>
                
                <label>
                  Height:
                  <input
                    type="number"
                    value={config.height}
                    onChange={(e) => handleSizeChange(sizeName, 'height', e.target.value)}
                    min="10"
                    max="4000"
                  />
                </label>
              </div>
              
              <div className="config-row">
                <label>
                  Mode:
                  <select
                    value={config.mode}
                    onChange={(e) => handleModeChange(sizeName, e.target.value)}
                  >
                    <option value="cover">Cover (fill, crop)</option>
                    <option value="contain">Contain (fit, letterbox)</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
          
          <button onClick={onReset} className="btn-reset">
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}
