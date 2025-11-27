import api from './api';

// Feed Getir (Ana Sayfa)
export const getFeed = async (page = 1, limit = 15) => {
  try {
    const response = await api.get('/activities/feed', {
      params: { page, limit }
    });
    
    console.log('📦 Feed Service Response:', response.data);
    
    // Eğer success wrapper varsa, içindeki activities'i al
    // Eğer success wrapper varsa, içindeki activities'i al
if (response.data.success) {
  return {
    activities: response.data.activities || [],
    page: response.data.page || page,
    totalPages: response.data.totalPages || 1,
    total: response.data.total || 0
  };
}
    
    // Yoksa direkt döndür
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