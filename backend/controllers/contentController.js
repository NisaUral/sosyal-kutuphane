const { Content } = require('../models');
const tmdbService = require('../services/tmdbService');
const googleBooksService = require('../services/googleBooksService');
const { Op } = require('sequelize');
const axios = require('axios');
const mysql = require('mysql2/promise');

const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// İçerik Ara (Film veya Kitap)
exports.searchContent = async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gerekli!'
      });
    }

    let results = [];

    // Film ara
    if (!type || type === 'movie') {
      const movies = await tmdbService.searchMovies(query);
      results = [...results, ...movies];
    }

    // Kitap arama
    if (type === 'book' || type === '') {
      try {
        const googleBooksUrl = `${process.env.GOOGLE_BOOKS_BASE_URL}/volumes?q=${query}&maxResults=20&orderBy=newest&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
        const googleResponse = await axios.get(googleBooksUrl);
        
        if (googleResponse.data.items) {
          const books = googleResponse.data.items.map(item => ({
            external_id: item.id,
            title: item.volumeInfo.title,
            type: 'book',
            year: item.volumeInfo.publishedDate?.substring(0, 4),
            author: item.volumeInfo.authors?.join(', ') || 'Bilinmiyor',
            description: item.volumeInfo.description || '',
            poster_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            page_count: item.volumeInfo.pageCount,
            publisher: item.volumeInfo.publisher,
            language: item.volumeInfo.language,
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
            categories: item.volumeInfo.categories || [],
            vote_average: item.volumeInfo.averageRating || 0
          }));
          
          results.push(...books);
        }
      } catch (error) {
        console.error('Google Books arama hatası:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });

  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama sırasında hata oluştu',
      error: error.message
    });
  }
};

// İçerik Detayı Al
exports.getContentDetails = async (req, res) => {
  try {
    const { externalId, type } = req.params;

    let content = await Content.findOne({
      where: {
        external_id: externalId,
        type: type
      }
    });

    if (!content) {
      let contentData;

      if (type === 'movie') {
        contentData = await tmdbService.getMovieDetails(externalId);
      } else if (type === 'book') {
        contentData = await googleBooksService.getBookDetails(externalId);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz içerik türü!'
        });
      }

      content = await Content.create(contentData);
    }

    res.status(200).json({
      success: true,
      content
    });

  } catch (error) {
    console.error('İçerik detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik detayı alınamadı',
      error: error.message
    });
  }
};

// Popüler Filmler
exports.getPopularMovies = async (req, res) => {
  try {
    const movies = await tmdbService.getPopularMovies();

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });

  } catch (error) {
    console.error('Popüler filmler hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Popüler filmler alınamadı',
      error: error.message
    });
  }
};

// En Yüksek Puanlı İçerikler
exports.getTopRated = async (req, res) => {
  try {
    const { type } = req.query;

    const whereClause = type ? { type } : {};

    const contents = await Content.findAll({
      where: whereClause,
      include: [{
        model: require('../models').Rating,
        as: 'ratings'
      }],
      limit: 20
    });

    const contentsWithAverage = contents.map(content => {
      const ratings = content.ratings;
      const avgScore = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

      return {
        ...content.toJSON(),
        average_score: avgScore.toFixed(1),
        rating_count: ratings.length
      };
    });

    contentsWithAverage.sort((a, b) => b.average_score - a.average_score);

    res.status(200).json({
      success: true,
      count: contentsWithAverage.length,
      contents: contentsWithAverage
    });

  } catch (error) {
    console.error('Top rated hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerikler alınamadı',
      error: error.message
    });
  }
};

// En Yüksek Puanlı Kitaplar
exports.getTopRatedBooks = async (req, res) => {
  try {
    const googleBooksUrl = `${process.env.GOOGLE_BOOKS_BASE_URL}/volumes?q=subject:fiction&orderBy=relevance&maxResults=40&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    
    console.log('📚 Top rated books isteniyor...');
    
    const googleResponse = await axios.get(googleBooksUrl);
    
    if (googleResponse.data.items) {
      let books = googleResponse.data.items.map(item => ({
        external_id: item.id,
        title: item.volumeInfo.title,
        type: 'book',
        year: item.volumeInfo.publishedDate?.substring(0, 4),
        author: item.volumeInfo.authors?.join(', ') || 'Bilinmiyor',
        description: item.volumeInfo.description || '',
        poster_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        page_count: item.volumeInfo.pageCount,
        publisher: item.volumeInfo.publisher,
        language: item.volumeInfo.language,
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        categories: item.volumeInfo.categories || [],
        vote_average: item.volumeInfo.averageRating || 0
      }));

      books = books
        .filter(book => book.vote_average > 0)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);

      console.log(`✅ ${books.length} yüksek puanlı kitap bulundu`);

      res.status(200).json({
        success: true,
        count: books.length,
        results: books
      });
    } else {
      res.status(200).json({
        success: true,
        count: 0,
        results: []
      });
    }
  } catch (error) {
    console.error('❌ Top rated books hatası:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kitaplar alınamadı',
      error: error.message
    });
  }
};
exports.getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.query;
    
    if (!genre) {
      return res.status(400).json({
        success: false,
        message: 'Tür belirtilmedi!'
      });
    }

    const movies = await tmdbService.getMoviesByGenre(genre);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });

  } catch (error) {
    console.error('Türe göre film hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Filmler alınamadı',
      error: error.message
    });
  }
};

// Türe göre kitaplar
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori belirtilmedi!'
      });
    }

    console.log('📚 Kategoriye göre kitap aranıyor:', category);

    // Google Books API - Daha geniş arama + kategori filtresi
    const googleBooksUrl = `${process.env.GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(category)}&orderBy=relevance&maxResults=40&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    
    console.log('📡 API URL:', googleBooksUrl);
    
    const googleResponse = await axios.get(googleBooksUrl);
    
    console.log('📦 API Response:', googleResponse.data.totalItems, 'toplam sonuç');
    
    if (googleResponse.data.items) {
      const books = googleResponse.data.items.map(item => ({
        external_id: item.id,
        title: item.volumeInfo.title,
        type: 'book',
        year: item.volumeInfo.publishedDate?.substring(0, 4),
        author: item.volumeInfo.authors?.join(', ') || 'Bilinmiyor',
        description: item.volumeInfo.description || '',
        poster_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        page_count: item.volumeInfo.pageCount,
        publisher: item.volumeInfo.publisher,
        language: item.volumeInfo.language,
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        categories: item.volumeInfo.categories || [],
        vote_average: item.volumeInfo.averageRating || 0
      }));

      console.log(`✅ ${books.length} kitap bulundu`);

      res.status(200).json({
        success: true,
        count: books.length,
        books
      });
    } else {
      console.log('❌ Hiç kitap bulunamadı');
      res.status(200).json({
        success: true,
        count: 0,
        books: []
      });
    }
  } catch (error) {
    console.error('❌ Kategoriye göre kitap hatası:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kitaplar alınamadı',
      error: error.message
    });
  }
};



// HİBRİT POPÜLERLİK SİSTEMİ
exports.getPopularContent = async (req, res) => {
  try {
    const { type } = req.query;
    const connection = await getConnection();

    const query = `
      SELECT 
        c.id,
        c.external_id,
        c.title,
        c.type,
        c.poster_url,
        c.year,
        COUNT(DISTINCT ul.id) as library_count,
        COUNT(DISTINCT r.id) as rating_count,
        COUNT(DISTINCT rv.id) as review_count,
        AVG(r.score) as avg_rating,
        (
          COUNT(DISTINCT ul.id) * 3 +
          COUNT(DISTINCT r.id) * 5 +
          COUNT(DISTINCT rv.id) * 7 +
          COALESCE(AVG(r.score), 0) * 2
        ) as popularity_score
      FROM contents c
      LEFT JOIN libraries ul ON c.id = ul.content_id
      LEFT JOIN ratings r ON c.id = r.content_id
      LEFT JOIN reviews rv ON c.id = rv.content_id
      ${type ? 'WHERE c.type = ?' : ''}
      GROUP BY c.id
      HAVING popularity_score > 0
      ORDER BY popularity_score DESC, library_count DESC
      LIMIT 20
    `;

    const params = type ? [type] : [];
    const [contents] = await connection.query(query, params);

    await connection.end();

    res.json({
      success: true,
      contents: contents,
      message: 'Uygulama içi verilerine göre popüler içerikler'
    });

  } catch (error) {
    console.error('Popüler içerik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// EN YÜKSEK PUANLILAR
exports.getTopRatedContent = async (req, res) => {
  try {
    const { type } = req.query;
    const connection = await getConnection();

    const query = `
      SELECT 
        c.id,
        c.external_id,
        c.title,
        c.type,
        c.poster_url,
        c.year,
        COUNT(r.id) as rating_count,
        AVG(r.score) as avg_rating
      FROM contents c
      INNER JOIN ratings r ON c.id = r.content_id
      ${type ? 'WHERE c.type = ?' : ''}
      GROUP BY c.id
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 20
    `;

    const params = type ? [type] : [];
    const [contents] = await connection.query(query, params);

    await connection.end();

    res.json({
      success: true,
      contents: contents,
      message: 'En yüksek puanlı içerikler'
    });

  } catch (error) {
    console.error('Top rated hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// ÇOK ÖNEMLİ: EXPORT!
module.exports = {
  searchContent: exports.searchContent,
  getContentDetails: exports.getContentDetails,
  getPopularMovies: exports.getPopularMovies,
  getTopRated: exports.getTopRated,
  getTopRatedBooks: exports.getTopRatedBooks,
  getMoviesByGenre: exports.getMoviesByGenre,
  getBooksByCategory: exports.getBooksByCategory,
  getPopularContent: exports.getPopularContent,     // ← EKLE
  getTopRatedContent: exports.getTopRatedContent
};