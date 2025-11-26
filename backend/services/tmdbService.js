const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL;

const GENRE_MAP = {
  28: 'Aksiyon',
  12: 'Macera',
  16: 'Animasyon',
  35: 'Komedi',
  80: 'Suç',
  99: 'Belgesel',
  18: 'Drama',
  10751: 'Aile',
  14: 'Fantastik',
  36: 'Tarih',
  27: 'Korku',
  10402: 'Müzik',
  9648: 'Gizem',
  10749: 'Romantik',
  878: 'Bilim Kurgu',
  10770: 'TV Filmi',
  53: 'Gerilim',
  10752: 'Savaş',
  37: 'Vahşi Batı'
};

// Film Ara
exports.searchMovies = async (query) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'tr-TR',
        page: 1
      }
    });

    const movies = response.data.results.map(movie => ({
      external_id: movie.id.toString(),
      type: 'movie',
      title: movie.title,
      original_title: movie.original_title,
      description: movie.overview,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      backdrop_url: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
      vote_average: movie.vote_average,
      popularity: movie.popularity,
      genres: movie.genre_ids ? movie.genre_ids.map(id => GENRE_MAP[id] || 'Bilinmiyor') : [] // ← EKLE
    }));

    return movies;
  } catch (error) {
    console.error('TMDb arama hatası:', error.message);
    throw new Error('Film arama sırasında hata oluştu');
  }
};

// Film Detayı Al
exports.getMovieDetails = async (movieId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
        append_to_response: 'credits'  // Oyuncular ve ekip
      }
    });

    const movie = response.data;
    const credits = movie.credits;

    // Yönetmeni bul
    const director = credits.crew.find(person => person.job === 'Director');

    // İlk 5 oyuncuyu al
    const cast = credits.cast.slice(0, 5).map(actor => actor.name);

    // Türleri al
    const genres = movie.genres.map(genre => genre.name);

    return {
      external_id: movie.id.toString(),
      type: 'movie',
      title: movie.title,
      original_title: movie.original_title,
      description: movie.overview,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      director: director ? director.name : null,
      runtime: movie.runtime,
      genres: genres,
      cast: cast,
      vote_average: movie.vote_average
    };
  } catch (error) {
    console.error('TMDb detay hatası:', error.message);
    throw new Error('Film detayı alınamadı');
  }
};

// Popüler Filmler
exports.getPopularMovies = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
        page: 1
      }
    });

    const movies = response.data.results.slice(0, 20).map(movie => ({
      external_id: movie.id.toString(),
      type: 'movie',
      title: movie.title,
      description: movie.overview,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      vote_average: movie.vote_average,
      genres: movie.genre_ids ? movie.genre_ids.map(id => GENRE_MAP[id] || 'Bilinmiyor') : [] // ← EKLE
    }));

    return movies;
  } catch (error) {
    console.error('Popüler filmler hatası:', error.message);
    throw new Error('Popüler filmler alınamadı');
  }
};

// Türe göre film ara
// Türe göre film ara
exports.getMoviesByGenre = async (genreName) => {
  try {
    // Tür isminden ID bul
    const genreId = Object.keys(GENRE_MAP).find(
      id => GENRE_MAP[id] === genreName
    );

    if (!genreId) {
      console.log('❌ Tür bulunamadı:', genreName);
      return [];
    }

    console.log('🎬 Türe göre arama:', genreName, '(ID:', genreId, ')');

    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page: 1
      }
    });

    const movies = response.data.results.slice(0, 40).map(movie => ({
      external_id: movie.id.toString(),
      type: 'movie',
      title: movie.title,
      description: movie.overview,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      vote_average: movie.vote_average,
      genres: movie.genre_ids ? movie.genre_ids.map(id => GENRE_MAP[id] || 'Bilinmiyor') : []
    }));

    console.log(`✅ ${movies.length} film bulundu`);
    return movies;
    
  } catch (error) {
    console.error('❌ Türe göre arama hatası:', error.message);
    return [];
  }
};