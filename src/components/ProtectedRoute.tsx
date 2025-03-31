// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'USER')[]; // İzin verilen roller (BÜYÜK HARF)
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, user, isLoading } = useAuth(); // isLoading'ı context'ten al
  const location = useLocation();

  console.log(`ProtectedRoute Guard: Path='${location.pathname}', isLoading=${isLoading}, isLoggedIn=${isLoggedIn}, userRole=${user?.role}, allowedRoles=${allowedRoles}`);

  // 1. AuthContext yükleniyor mu? Bekle.
  if (isLoading) {
    console.log("ProtectedRoute: Auth context is loading, showing loading indicator.");
    return <div className="flex justify-center items-center min-h-screen">Checking authentication...</div>;
  }

  // 2. Giriş yapılmış mı? Yapılmadıysa login'e yönlendir.
  if (!isLoggedIn) {
    console.log("ProtectedRoute: User not logged in, redirecting to /login.");
    // Kullanıcıyı login'e yönlendirirken, nereden geldiğini state olarak gönder.
    // Başarılı login sonrası buraya geri yönlendirme yapılabilir.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Rol kontrolü gerekli mi? Gerekliyse ve rol uymuyorsa?
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     console.warn(`ProtectedRoute: Unauthorized access attempt to ${location.pathname} by user ${user.email} with role ${user.role}. Allowed roles: ${allowedRoles.join(', ')}. Redirecting.`);
     // Yetkisiz erişim. Kullanıcının kendi varsayılan sayfasına veya login'e yönlendirilebilir.
     // Örneğin, USER rolündeki bir kullanıcı /admin'e girmeye çalışırsa /personel'e yönlendir:
     if (user.role === 'USER') {
        return <Navigate to="/personel" replace />;
     }
     // Diğer yetkisiz durumlarda (veya ADMIN /personel'e girmeye çalışırsa vb.) login'e fallback mantıklı olabilir.
     return <Navigate to="/login" replace />; // Veya <Navigate to="/unauthorized" replace />;
  }

  // 4. Tüm kontrollerden geçtiyse, istenen sayfayı (children) göster.
  console.log(`ProtectedRoute: Access granted to ${location.pathname} for user ${user?.email} with role ${user?.role}.`);
  return <>{children}</>;
}