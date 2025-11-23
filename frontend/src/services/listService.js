import api from './api';

// Kullanıcının listelerini getir
export const getUserLists = async (userId) => {
  try {
    const response = await api.get(`/lists/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Listeler alınamadı!';
  }
};

// Yeni liste oluştur
export const createList = async (name, description, isPublic = true) => {
  try {
    const response = await api.post('/lists', {
      name,
      description,
      is_public: isPublic
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Liste oluşturulamadı!';
  }
};

// Liste detayı
export const getListDetails = async (listId) => {
  try {
    const response = await api.get(`/lists/${listId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Liste detayı alınamadı!';
  }
};

// Listeye içerik ekle
export const addToList = async (listId, contentId) => {
  try {
    const response = await api.post(`/lists/${listId}/items`, {
      contentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Listeye eklenemedi!';
  }
};

// Listeden çıkar
export const removeFromList = async (listId, contentId) => {
  try {
    const response = await api.delete(`/lists/${listId}/items/${contentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Listeden çıkarılamadı!';
  }
};

// Liste sil
export const deleteList = async (listId) => {
  try {
    const response = await api.delete(`/lists/${listId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Liste silinemedi!';
  }
};