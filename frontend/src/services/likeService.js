import api from './api';

// Beğen/Beğeniyi Kaldır
export const toggleLike = async (activityId) => {
  try {
    console.log('💙 toggleLike çağrıldı:', activityId);
    
    const response = await api.post('/likes/toggle', {
      activity_id: activityId  // Body'de gönder
    });
    
    console.log('✅ toggleLike yanıtı:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ toggleLike hatası:', error);
    throw error.response?.data?.message || 'Beğeni işlemi başarısız!';
  }
};

// Beğeni sayısını al
export const getLikesCount = async (activityId) => {
  try {
    const response = await api.get(`/likes/${activityId}/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Beğeni sayısı alınamadı!';
  }
};