// src/main.tsx (veya index.tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ana Router bileşeni
import './index.css';
import { AuthProvider } from './context/AuthContext'; // AuthProvider'ı import et

ReactDOM.createRoot(document.getElementById('root')!).render(
 
  <React.StrictMode>
    <AuthProvider> {/* Router'ı ve tüm uygulamayı sar */}
      <App />
    </AuthProvider>
  </React.StrictMode>
  
);