// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'USER')[]; // İzin verilen roller (opsiyonel)
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation(); // Mevcut konumu al

  if (isAuthLoading) {
    // Auth context yüklenirken bekle
    return <div className="flex justify-center items-center min-h-screen">Checking authentication...</div>;
  }

  if (!isLoggedIn) {
    // Giriş yapılmamışsa, login sayfasına yönlendir
    // Mevcut konumu state olarak gönderelim ki login sonrası geri dönebilsin (opsiyonel)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rol kontrolü gerekiyorsa ve kullanıcının rolü izin verilenlerde yoksa
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     // Yetkisiz erişim durumu - /personel'e veya başka bir sayfaya yönlendir
     console.warn(`Unauthorized access attempt to ${location.pathname} by user with role ${user.role}`);
     // Eğer personel admin sayfasına girmeye çalışıyorsa personele yönlendirilebilir
     if (user.role === 'USER') {
         return <Navigate to="/personel" replace />;
     }
     // Diğer durumlarda login'e veya yetkisiz sayfasına yönlendir
    return <Navigate to="/login" replace />; // Veya <Navigate to="/unauthorized" replace />
  }

  // Her şey yolundaysa, istenen bileşeni (children) render et
  return <>{children}</>;
}