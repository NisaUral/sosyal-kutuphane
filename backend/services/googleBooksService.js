const axios = require('axios');

const GOOGLE_BOOKS_BASE_URL = process.env.GOOGLE_BOOKS_BASE_URL;
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY; 


// Kitap Ara
exports.searchBooks = async (query) => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}/volumes`, {
      params: {
        q: query,
        maxResults: 20,
        printType: 'books',
        key: API_KEY // API Key eklendi
      }
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      return {
        external_id: item.id,
        type: 'book',
        title: volumeInfo.title,
        subtitle: volumeInfo.subtitle || null,
        description: volumeInfo.description || '',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmiyor',
        year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null,
        poster_url: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail?.replace('http:', 'https:') : null,
        page_count: volumeInfo.pageCount || null,
        genres: volumeInfo.categories || []
      };
    });
  } catch (error) {
    console.error('Google Books arama hatası:', error.message);
    return []; // Hata fırlatmak yerine boş dizi dönelim, uygulama çökmesin
  }
};

// Kitap Detayı Al (DÜZELTİLEN KISIM BURASI)
exports.getBookDetails = async (bookId) => {
  // bookId burada bir string (örn: "tTQgEQAAQBAJ") olarak gelir.
  // req.params KULLANILMAMALIDIR.
  
  try {
    // URL'ye API Key eklemek her zaman daha iyidir
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes/${bookId}?key=${API_KEY}`;
    
    const response = await axios.get(url);
    const volumeInfo = response.data.volumeInfo;

    // Veritabanı modeline uygun obje döndür
    return {
      external_id: response.data.id,
      type: 'book',
      title: volumeInfo.title,
      subtitle: volumeInfo.subtitle || null,
      description: volumeInfo.description || '', // null yerine boş string daha güvenli
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmiyor',
      year: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : null,
      poster_url: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail?.replace('http:', 'https:') : null,
      page_count: volumeInfo.pageCount || 0,
      genres: volumeInfo.categories || [],
      publisher: volumeInfo.publisher || null,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || null // ISBN ekledim, lazım olabilir
    };
  } catch (error) {
    console.error(`Google Books detay hatası (ID: ${bookId}):`, error.message);
    // Hatayı yukarı fırlat ki Controller yakalasın
    throw new Error('Google Books servisinden veri alınamadı.');
  }
};