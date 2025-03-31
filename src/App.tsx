// App.tsx (Güncellenmiş)
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PersonelApp from './pages/Personel';
import YoneticiApp from './pages/Yonetici';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';




function App() {
  const { isLoggedIn, user, isLoading } = useAuth();

  const DefaultRoute = () => {
      // Konsol logları debug için kalabilir
      console.log(`DefaultRoute Check: isLoading=${isLoading}, isLoggedIn=${isLoggedIn}, userRole=${user?.role}`);

      if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading Session...</div>; // Yüklenirken bekle

      if (!isLoggedIn) return <Navigate to="/login" replace />;

      // --- ROL KONTROLÜ DÜZELTİLDİ ---
      // AuthContext'teki küçük harfli rolleri kullan
      if (user?.role === 'ADMIN') return <Navigate to="/yonetici" replace />;
      if (user?.role === 'USER') return <Navigate to="/personel" replace />;
      // --- Düzeltme Sonu ---

      // Rol tanımlı değilse veya beklenmedik bir durumsa login'e yönlendir
      console.warn("DefaultRoute: Unknown user role or state issue, redirecting to /login");
      return <Navigate to="/login" replace />;
  };

  return (
      <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Yönetici Paneli - Rol kontrolü küçük harfle */}
              <Route
                path="/yonetici/*"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}> {/* Küçük harf 'admin' */}
                    <YoneticiApp />
                  </ProtectedRoute>
                }
              />

              {/* Personel Paneli - Rol kontrolü küçük harfle */}
              <Route
                path="/personel/*"
                element={
                   <ProtectedRoute allowedRoles={['ADMIN', 'USER']}> {/* Küçük harf roller */}
                    <PersonelApp />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<DefaultRoute />} />

              <Route path="*" element={<div><h1>404 Not Found</h1><a href="/">Go Home</a></div>} />
            </Routes>
      </Router>
  )
}

export default App;
