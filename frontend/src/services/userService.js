import api from './api';

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
export const uploadAvatar = async (avatar_url) => {
  try {
    const response = await api.post('/users/avatar', { avatar_url });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Avatar yüklenemedi!';
  }
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