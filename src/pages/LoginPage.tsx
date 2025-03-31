// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth, AuthUser } from '../context/AuthContext'; // AuthUser'ı import et
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const apiBaseUrl: string = window.location.origin;
const apiBaseUrl1: string = window.location.hostname;

console.log('API Base URL:', apiBaseUrl);
console.log('API Base URL 1:', apiBaseUrl1);

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("Attempting login with email:", email); // Email'i logla

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log("Login Raw Response Data:", response.data); // Tüm yanıtı logla

      // 1. Temel yapı kontrolü
      if (!response.data || !response.data.userData || !response.data.reqUser) {
        console.error("Login Error: Missing top-level structure (userData or user)");
        throw new Error('Unexpected response structure received from server.');
      }

      // 2. Token'ı al ve kontrol et
      const token = response.data.userData.token;
      if (!token || typeof token !== 'string') {
        console.error("Login Error: Missing or invalid token in userData");
        throw new Error('Authentication token was not received from server.');
      }
      console.log("Token received:", token ? "Yes (length: " + token.length + ")" : "No");

      // 3. Kullanıcı bilgilerini al ve kontrol et
      const backendUser = response.data.reqUser;
      if (!backendUser || typeof backendUser !== 'object') {
         console.error("Login Error: Missing or invalid user object");
         throw new Error('User details object was not received from server.');
      }
      console.log("Backend User Object:", backendUser);

      // 4. Gerekli kullanıcı alanlarını kontrol et
      if (backendUser.id === undefined || backendUser.id === null) { // Hem undefined hem null kontrolü
          console.error("Login Error: Missing user ID");
          throw new Error('Essential user detail (ID) missing in server response.');
      }
       if (!backendUser.user.email || typeof backendUser.user.email !== 'string') {
           console.error("Login Error: Missing or invalid user email");
           throw new Error('Essential user detail (email) missing in server response.');
       }
        if (!backendUser.role || typeof backendUser.role !== 'string') {
            console.error("Login Error: Missing or invalid user role");
            throw new Error('Essential user detail (role) missing in server response.');
        }
       console.log(`Essential fields check: ID=${backendUser.id}, Email=${backendUser.user.email}, Role=${backendUser.role}`);

      // 5. AuthUser nesnesini oluştur
      const userRole = backendUser.role.toUpperCase(); // Büyük harfe çevirip karşılaştır
      const frontendRole = userRole === 'ADMIN' ? 'ADMIN' : 'USER';
      console.log(`Mapping role: Backend='${backendUser.role}' -> Frontend='${frontendRole}'`);

      const authUserData: AuthUser = {
          userId: backendUser.id.toString(), // ID'yi string yap
          email: backendUser.user.email,
          role: frontendRole
      };
      console.log("Prepared AuthUser for context:", authUserData);

      // 6. Context'teki login fonksiyonunu çağır
      login(token, authUserData);
      console.log("Login context updated. Navigating to '/'...");

      // Yönlendirme
      navigate('/', { replace: true });

    } catch (err: any) {
      console.error("Login Submit Error:", err);
      // Hata mesajını daha belirgin hale getir
      let errorMessage = 'Login failed. Please check credentials or server status.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
         errorMessage = err.message; // Kendi throw ettiğimiz hatalar
      }
      setError(errorMessage);
      console.log("Setting error state:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX (Aynı kalır) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* ... Form ... */}
       <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
            <h1 className="text-2xl font-bold text-center mb-6">POS Login</h1>
            <form onSubmit={handleSubmit}>
              {error && <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded text-center">{error}</div>}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" autoComplete="email"/>
              </div>
              <div className="mb-6">
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                 <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" autoComplete="current-password"/>
               </div>
               <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors disabled:opacity-50" >
                 {isLoading ? 'Logging in...' : 'Login'}
               </button>
            </form>
            <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">{apiBaseUrl1}</label>
          </div>
    </div>
  );
}