// src/App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PersonelApp from './pages/Personel'; // Doğru yolu kontrol et
import YoneticiApp from './pages/Yonetici'; // Doğru yolu kontrol et
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Rotaları ve ana yönlendirme mantığını içeren bileşen
function AppRoutes() {
  const { isLoggedIn, user, isLoading } = useAuth();
  const location = useLocation(); // Anlık konumu almak için

  console.log(`AppRoutes: Path='${location.pathname}', isLoading=${isLoading}, isLoggedIn=${isLoggedIn}, userRole=${user?.role}`);

  // --- AuthContext Yüklenirken Bekleme ---
  if (isLoading) {
    console.log("AppRoutes: Auth context is loading, showing main loading indicator.");
    // Tüm sayfa yerine sadece rotaların olduğu alanı kaplayan bir yükleyici daha iyi olabilir
    // veya tam ekran yükleyici de kalabilir.
    return <div className="flex justify-center items-center min-h-screen">Uygulama Başlatılıyor...</div>;
  }

  // --- Kök Dizin (/) veya Bilinmeyen Rota (*) için Yönlendirici ---
  const RedirectBasedOnAuth = () => {
    // isLoading kontrolü zaten yukarıda yapıldı.
    if (!isLoggedIn) {
        console.log("RedirectBasedOnAuth: Not logged in, redirecting to /login.");
        return <Navigate to="/login" replace />;
    }
    // Rolleri BÜYÜK HARF ile kontrol et
    if (user?.role === 'ADMIN') {
        console.log("RedirectBasedOnAuth: Admin user, redirecting to /yonetici.");
        return <Navigate to="/yonetici" replace />;
    }
    if (user?.role === 'USER') {
        console.log("RedirectBasedOnAuth: User role, redirecting to /personel.");
        return <Navigate to="/personel" replace />;
    }
    // Tanımsız rol veya beklenmedik durum (olmamalı ama fallback)
    console.warn("RedirectBasedOnAuth: Unknown role or state issue, redirecting to /login as fallback.");
    return <Navigate to="/login" replace />;
  };

  // --- /login Rotası İçin Özel Sarmalayıcı ---
  const LoginPageWrapper = () => {
    // isLoading kontrolü yukarıda yapıldı.
    if (isLoggedIn) {
      // Zaten giriş yapmışsa, tekrar login'e değil, panele yönlendir.
      console.log("LoginPageWrapper: Already logged in, redirecting away from /login.");
      return <RedirectBasedOnAuth />;
    }
    // Giriş yapmamışsa Login sayfasını göster
    console.log("LoginPageWrapper: Not logged in, rendering LoginPage.");
    return <LoginPage />;
  };

  // --- Ana Rota Tanımları ---
  return (
     <Routes>
       {/* Login Sayfası: Giriş yapmış kullanıcıları yönlendirir */}
       <Route path="/login" element={<LoginPageWrapper />} />

       {/* Yönetici Paneli: Sadece ADMIN erişebilir (Rol BÜYÜK HARF) */}
       <Route
         path="/yonetici/*" // Alt rotalara izin vermek için "/*"
         element={
           <ProtectedRoute allowedRoles={['ADMIN']}>
             <YoneticiApp />
           </ProtectedRoute>
         }
       />

       {/* Personel Paneli: ADMIN ve USER erişebilir (Roller BÜYÜK HARF) */}
       <Route
         path="/personel/*" // Alt rotalara izin vermek için "/*"
         element={
           <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
             <PersonelApp />
           </ProtectedRoute>
         }
       />

       {/* Kök Dizin: Giriş durumuna göre yönlendirir */}
       <Route path="/" element={<RedirectBasedOnAuth />} />

       {/* Bulunamayan Rotalar (404) */}
       {/* İstersen burayı da RedirectBasedOnAuth ile değiştirip bilinmeyen yolları da panele/logine atabilirsin */}
       <Route path="*" element={
           <div className="flex flex-col justify-center items-center min-h-screen">
               <h1 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h1>
               {/* HashRouter kullandığımız için link #/ olmalı */}
               <a href="#/" className="text-blue-500 hover:underline">Ana Sayfaya Dön</a>
            </div>
       } />
     </Routes>
  );
}

// Ana App bileşeni sadece Router'ı ve AppRoutes'ı render eder
function App() {
  return (
    // Electron için genellikle HashRouter tercih edilir.
    <Router>
       <AppRoutes />
    </Router>
  );
}

export default App;