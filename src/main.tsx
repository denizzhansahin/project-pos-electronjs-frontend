// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // AuthProvider'ı import et
import './index.css'; // Ana stil dosyanız (Tailwind vb.)

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Fatal Error: Root element 'root' not found in the DOM.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* AuthProvider tüm uygulamayı sarmalı */}
    <AuthProvider>
      {/* App bileşeni artık context'e erişebilir */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);