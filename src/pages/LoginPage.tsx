// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react'; // useEffect import edildi
import { useAuth, AuthUser } from '../context/AuthContext';
import { useLocation } from 'react-router-dom'; // useNavigate artık kullanılmıyor
import apiClient from '../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // logout fonksiyonunu ve isLoggedIn durumunu context'ten al
  const { login, logout, isLoggedIn } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // --- YENİ EKLENEN KISIM ---
  // Bu bileşen her mount olduğunda (yani login sayfası her açıldığında)
  // mevcut oturumu temizle (varsa).
  useEffect(() => {
    console.log("LoginPage Mounted: Ensuring any existing session is cleared.");
    // Koşulsuz olarak logout çağır. Eğer zaten çıkış yapılmışsa bir şey yapmaz.
    logout();
    // Bu effect'in sadece mount'ta çalışması için boş dependency array kullanmıyoruz,
    // çünkü logout fonksiyonunu kullanıyoruz. logout'u dependency array'e ekliyoruz.
    // logout useCallback ile memoize edildiği için gereksiz tekrar çalışmayı tetiklemez.
  }, [logout]);
  // --- YENİ EKLENEN KISIM SONU ---

  console.log(`LoginPage: Rendering. State after potential clear: isLoggedIn=${isLoggedIn}`);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("LoginPage: Attempting login with email:", email);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log("LoginPage: Login Raw Response Data:", response.data);

      // ---- Backend Yanıtı Doğrulama (Aynı kalır) ----
      if (!response.data || !response.data.userData || !response.data.reqUser) {
          throw new Error('Login Error: Unexpected response structure (missing userData or reqUser).');
      }
      const token = response.data.userData.token;
      if (!token || typeof token !== 'string') {
          throw new Error('Login Error: Missing or invalid token in response.');
      }
      const backendUser = response.data.reqUser;
      if (!backendUser || typeof backendUser !== 'object' || backendUser.id === undefined || backendUser.id === null || !backendUser.user?.email || !backendUser.role) {
          throw new Error('Login Error: Missing or invalid user details (id, email, role) in response.');
      }
      console.log("LoginPage: Backend User Details:", backendUser);

      // ---- AuthUser Nesnesi Oluşturma (Aynı kalır) ----
      const backendRoleUpper = backendUser.role.toUpperCase();
      const frontendRole = backendRoleUpper === 'ADMIN' ? 'ADMIN' : 'USER';
      if (backendRoleUpper !== 'ADMIN' && backendRoleUpper !== 'USER') {
        console.warn(`LoginPage: Received unknown role '${backendUser.role}' from backend. Defaulting to USER.`);
        throw new Error(`Login Error: Unknown user role '${backendUser.role}' received.`);
      }
      const authUserData: AuthUser = {
          userId: backendUser.id.toString(),
          email: backendUser.user.email,
          role: frontendRole
      };
      console.log("LoginPage: Prepared AuthUser for context:", authUserData);

      // ---- Context'i Güncelle (Aynı kalır) ----
      login(token, authUserData);
      console.log("LoginPage: Login successful, AuthContext updated.");

      // Yönlendirme hala App.tsx tarafından yönetilecek.

    } catch (err: any) {
      console.error("LoginPage: Login Submit Error:", err);
      let errorMessage = 'Login failed. Please check credentials or server status.';
       if (err.response?.data?.message) {
         errorMessage = err.response.data.message;
       } else if (err.message?.startsWith('Login Error:')) {
          errorMessage = err.message;
       } else if (err.message) {
          errorMessage = err.message;
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX (Aynı kalır) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
       <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
            <h1 className="text-2xl font-bold text-center mb-6">POS Login</h1>
            <form onSubmit={handleSubmit}>
              {error && <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded text-center">{error}</div>}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  autoComplete="email"
                  />
              </div>
              <div className="mb-6">
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                 <input
                   type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   autoComplete="current-password"
                 />
               </div>
               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isLoading ? 'Logging in...' : 'Login'}
               </button>
            </form>
          </div>
    </div>
  );
}