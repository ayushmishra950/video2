import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Polyfill process for browser
window.process = {
  env: { NODE_ENV: "development" },
  nextTick: (cb, ...args) => setTimeout(cb, 0, ...args) // polyfill nextTick
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
