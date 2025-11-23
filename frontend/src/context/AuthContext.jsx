import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Başlangıçta loading true
  const navigate = useNavigate();

  // İlk yüklemede token kontrolü
  useEffect(() => {
  const initAuth = async () => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Token'ı doğrula
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log('✅ Token geçerli, kullanıcı giriş yaptı:', data.user.username);
        } else {
          // Token geçersiz, temizle
          console.log('❌ Token geçersiz, logout yapılıyor');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }

    setLoading(false);
  };

  initAuth();
}, []);

  const login = (userData, token) => {
    console.log('✅ Login yapılıyor:', userData.username);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
  console.log('🔄 User güncelleniyor:', userData.username);
  sessionStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
};

  const logout = () => {
    console.log('🚪 Logout yapılıyor');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}