import api from './api';

// Feed Getir (Ana Sayfa)
export const getFeed = async (page = 1, limit = 15) => {
  try {
    const response = await api.get('/activities/feed', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Feed alınamadı!';
  }
};

// Kullanıcı Aktiviteleri
export const getUserActivities = async (userId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/activities/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Aktiviteler alınamadı!';
  }
};