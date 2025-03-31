// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../services/api';

// Frontend'de kullanılacak tutarlı kullanıcı yapısı (Roller BÜYÜK HARF)
export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (newToken: string, userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  // isLoading başlangıçta true olmalı ki temizlik bitene kadar yönlendirme olmasın
  const [isLoading, setIsLoading] = useState(true);

  // --- DEĞİŞİKLİK BURADA ---
  // Uygulama ilk yüklendiğinde localStorage'ı temizle
  useEffect(() => {
    console.log("AuthProvider: Clearing previous session data on startup...");
    try {
      // Kayıtlı token ve kullanıcı bilgilerini sil
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      console.log("AuthProvider: Previous session data cleared from localStorage.");

      // API istemcisindeki Authorization header'ını da temizle (varsa)
      delete apiClient.defaults.headers.common['Authorization'];

      // State'leri de başlangıç değerlerine çek (emin olmak için)
      setToken(null);
      setUser(null);

    } catch (error) {
      console.error("AuthProvider: Error clearing localStorage on startup.", error);
      // Hata olsa bile devam etmeye çalışabiliriz, en azından state null olur.
    } finally {
      // Temizleme işlemi bittikten sonra yükleme durumunu false yap
      setIsLoading(false);
      console.log("AuthProvider: Initial loading complete (after clearing session).");
    }
  }, []); // Boş dependency array [], bu etkinin sadece bileşen ilk mount edildiğinde çalışmasını sağlar.
  // --- DEĞİŞİKLİK SONU ---


  const login = useCallback((newToken: string, userData: AuthUser) => {
    console.log("AuthProvider: Logging in user:", userData.email, "with role:", userData.role);
    setToken(newToken);
    setUser(userData);
    // Sadece login işlemi başarılı olduğunda localStorage'a yaz
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setIsLoading(false); // Login sonrası yükleme durumu false olmalı
  }, []);

  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out.");
    setToken(null);
    setUser(null);
    // Logout olduğunda da localStorage'ı temizle
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete apiClient.defaults.headers.common['Authorization'];
    setIsLoading(false); // Logout sonrası da yükleme durumu false
  }, []);

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};