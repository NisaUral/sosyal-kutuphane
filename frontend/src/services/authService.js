import api from './api';

// Kullanıcı Kaydı
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Token'ı kaydet
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Kayıt işlemi başarısız!';
  }
};

// Kullanıcı Girişi
export const login = async (credentials) => {
  try {
    console.log('Sending login request with:', credentials); // Debug
    const response = await api.post('/auth/login', credentials);
    console.log('Login response:', response.data); // Debug
    
    // Token'ı kaydet
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login service error:', error); // Debug
    throw error.response?.data?.message || 'Giriş başarısız!';
  }
};

// loginUser alias
export const loginUser = login;

// Çıkış
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Kullanıcı Bilgilerini Al
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    throw error.response?.data?.message || 'Kullanıcı bilgileri alınamadı!';
  }
};

// Token var mı kontrol
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Kaydedilmiş kullanıcıyı al
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Şifre sıfırlama isteği
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'İstek gönderilemedi!';
  }
};

// Şifre sıfırla
export const resetPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      newPassword,
      resetToken
      
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Şifre sıfırlanamadı!';
  }
};