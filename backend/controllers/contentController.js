const { Content } = require('../models');
const tmdbService = require('../services/tmdbService');
const googleBooksService = require('../services/googleBooksService');
const { Op } = require('sequelize');
const axios = require('axios');

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

// ÇOK ÖNEMLİ: EXPORT!
module.exports = {
  searchContent: exports.searchContent,
  getContentDetails: exports.getContentDetails,
  getPopularMovies: exports.getPopularMovies,
  getTopRated: exports.getTopRated,
  getTopRatedBooks: exports.getTopRatedBooks
};