// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../services/api';

// Frontend'de kullanılacak tutarlı kullanıcı yapısı
export interface AuthUser {
  userId: string; // Backend'den gelen id'yi buraya map edeceğiz (genelde string tutmak daha iyidir)
  email: string;
  role: 'ADMIN' | 'USER'; // Küçük harfli roller
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Checking localStorage for auth data...");
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.userId && parsedUser.email && parsedUser.role) {
          console.log("AuthProvider: Found valid auth data in localStorage.");
          setToken(storedToken);
          setUser(parsedUser);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
           console.warn("AuthProvider: Invalid user data in localStorage. Clearing.");
           localStorage.removeItem('authToken');
           localStorage.removeItem('authUser');
        }
      } catch (error) {
        console.error("AuthProvider: Error parsing localStorage data. Clearing.", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    } else {
        console.log("AuthProvider: No auth data found in localStorage.");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, userData: AuthUser) => {
    console.log("AuthProvider: Logging in user:", userData.email, "with role:", userData.role);
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out.");
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete apiClient.defaults.headers.common['Authorization'];
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