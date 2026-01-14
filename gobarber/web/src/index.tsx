import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (process.env.NODE_ENV === 'development' && 'ResizeObserver' in window) {
  const OriginalResizeObserver = window.ResizeObserver;

  window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => callback(entries, observer));
      });
    }
  };
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
