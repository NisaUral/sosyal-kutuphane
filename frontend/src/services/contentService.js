import api from './api';
import axios from 'axios';

// İçerik Ara (Film/Kitap)
export const searchContent = async (query, type = '') => {
  try {
    const response = await api.get('/contents/search', {
      params: { query, type }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Arama başarısız!';
  }
};

// İçerik Detayı
// İçerik Detayı
export const getContentDetails = async (type, externalId) => {
  try {
    const endpoint = type === 'movie' ? 'movie' : 'book';
    const response = await api.get(`/contents/${endpoint}/${externalId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'İçerik detayı alınamadı!';
  }
};

// Popüler Filmler
export const getPopularMovies = async () => {
  try {
    const response = await api.get('/contents/popular/movies');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Popüler filmler alınamadı!';
  }
};

// Popüler Kitaplar
export const getPopularBooks = async () => {
  try {
    // Daha popüler ve genel bir arama
    const response = await api.get('/contents/search', {
      params: { query: 'popular fiction', type: 'book' }
    });
    
    const books = (response.data.results || []).filter(item => item.type === 'book');
    
    return {
      ...response.data,
      results: books
    };
  } catch (error) {
    throw error.response?.data?.message || 'Popüler kitaplar alınamadı!';
  }
};

// En yüksek puanlı kitaplar
export const getTopRatedBooks = async () => {
  try {
    const response = await api.get('/contents/top-rated-books');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Kitaplar yüklenemedi!';
  }
};

// Türe göre filmler
export const getMoviesByGenre = async (genre) => {
  try {
    const response = await api.get('/contents/movies/genre', {
      params: { genre }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Filmler alınamadı!';
  }
};

// Kategoriye göre kitaplar
export const getBooksByCategory = async (category) => {
  try {
    const response = await api.get('/contents/books/category', {
      params: { category }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Kitaplar alınamadı!';
  }
};

