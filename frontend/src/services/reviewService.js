import api from './api';

// Yorumları getir
export const getReviews = async (contentId) => {
  try {
    const response = await api.get(`/reviews/content/${contentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Yorumlar alınamadı!';
  }
};

// Yorum ekle
export const addReview = async (contentId, reviewText) => {
  try {
    const response = await api.post('/reviews', {
      content_id: contentId,
      review_text: reviewText
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Yorum eklenemedi!';
  }
};
// Yorumu düzenle
export const updateReview = async (reviewId, reviewText) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, {
      review_text: reviewText
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Yorum güncellenemedi!';
  }
};

// Yorumu sil
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Yorum silinemedi!';
  }
};