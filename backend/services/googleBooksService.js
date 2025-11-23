const axios = require('axios');

const GOOGLE_BOOKS_BASE_URL = process.env.GOOGLE_BOOKS_BASE_URL;

// Kitap Ara
exports.searchBooks = async (query) => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}/volumes`, {
      params: {
        q: query,
        maxResults: 20,
        printType: 'books'
      }
    });

    if (!response.data.items) {
      return [];
    }

    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      
      return {
        external_id: item.id,
        type: 'book',
        title: volumeInfo.title,
        subtitle: volumeInfo.subtitle || null,
        description: volumeInfo.description || null,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : null,
        year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
        poster_url: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
        page_count: volumeInfo.pageCount || null,
        genres: volumeInfo.categories || []
      };
    });

    return books;
  } catch (error) {
    console.error('Google Books arama hatası:', error.message);
    throw new Error('Kitap arama sırasında hata oluştu');
  }
};

// Kitap Detayı Al
exports.getBookDetails = async (bookId) => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}/volumes/${bookId}`);

    const volumeInfo = response.data.volumeInfo;

    return {
      external_id: response.data.id,
      type: 'book',
      title: volumeInfo.title,
      subtitle: volumeInfo.subtitle || null,
      description: volumeInfo.description || null,
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : null,
      year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
      poster_url: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
      page_count: volumeInfo.pageCount || null,
      genres: volumeInfo.categories || [],
      publisher: volumeInfo.publisher || null
    };
  } catch (error) {
    console.error('Google Books detay hatası:', error.message);
    throw new Error('Kitap detayı alınamadı');
  }
};