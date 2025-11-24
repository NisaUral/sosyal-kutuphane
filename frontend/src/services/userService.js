import api from './api';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Kullanıcı Profilini Getir
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Profil alınamadı!';
  }
};

// Kullanıcının Kütüphanesini Getir
export const getUserLibrary = async (userId, status = '') => {
  try {
    const response = await api.get(`/library/user/${userId}`, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Kütüphane alınamadı!';
  }
};

// Takipçileri Getir
export const getFollowers = async (userId) => {
  try {
    const response = await api.get(`/follows/followers/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Takipçiler alınamadı!';
  }
};

// Takip Edilenleri Getir
export const getFollowing = async (userId) => {
  try {
    const response = await api.get(`/follows/following/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Takip edilenler alınamadı!';
  }
};

// Kullanıcıyı Takip Et
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/follows/${userId}`);  // ← DOĞRU!
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Takip edilemedi!';
  }
};

// Takibi Bırak
export const unfollowUser = async (userId) => {
  try {
     const response = await api.delete(`/follows/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Takip bırakılamadı!';
  }
};

// Takip Durumunu Kontrol Et
export const checkFollowStatus = async (userId) => {
  try {
    const response = await api.get(`/follows/status/${userId}`);
    return response.data;
  } catch (error) {
    return { isFollowing: false };
  }
};
// Profil güncelle
// Profil güncelleme
export const updateProfile = async (username, email, avatar_url, bio) => {  // ← bio eklendi
  try {
    const response = await api.put('/users/profile', {
      username,
      email,
      avatar_url,
      bio  // ← YENİ
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Profil güncellenemedi!';
  }
};

// Avatar yükle
// Avatar yükle
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
      // Content-Type EKLEME! FormData otomatik ayarlar
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Avatar yüklenemedi!');
  }

  return data;
};

// Önerilen kullanıcılar
// Önerilen kullanıcılar
export const getSuggestedUsers = async () => {
  try {
    const response = await api.get('/users/suggestions/list');  // ← /list eklendi
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Öneriler yüklenemedi!';
  }
};

// Kullanıcı istatistikleri
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'İstatistikler yüklenemedi!';
  }
};

