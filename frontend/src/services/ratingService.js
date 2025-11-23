import api from './api';

// Puan ver
export const addRating = async (contentId, score) => {
  try {
    const response = await api.post('/ratings', {
      content_id: contentId,
      score: score
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Puan verilemedi!';
  }
};

// Kullanıcının puanını getir
export const getUserRating = async (contentId) => {
  try {
    const response = await api.get(`/ratings/content/${contentId}`);
    return response.data;
  } catch (error) {
    return { rating: null };
  }
};