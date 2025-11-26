import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { searchContent, getPopularMovies, getTopRatedBooks } from '../services/contentService';

function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [results, setResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filterYear, setFilterYear] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [topBooks, setTopBooks] = useState([]);

  // Arama fonksiyonu
  const handleSearch = useCallback(async (query = searchQuery, tab = activeTab) => {
    if (!query.trim()) {
      // Arama boşsa popüler içerikleri göster
      handleTabChange(tab);
      return;
    }

    setLoading(true);
    try {
      const type = tab === 'all' ? '' : tab;
      const data = await searchContent(query, type);
      setResults(data.results || []);
      setPopularMovies([]); // Popüler filmleri temizle
    } catch (error) {
      console.error('Arama hatası:', error);
      setResults([]);
    }
    setLoading(false);
  }, [searchQuery, activeTab]);

  // ANLIK ARAMA - searchQuery değişince 500ms sonra ara
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery, activeTab);
      } else {
        // Arama boşsa popüler içerikleri göster
        setResults([]);
        handleTabChange(activeTab);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // URL'den gelen arama
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery, activeTab);
    }
  };

  // Tab değiştirme
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    
    if (searchQuery.trim()) {
      // Arama varsa, yeni tab ile tekrar ara
      handleSearch(searchQuery, tab);
    } else {
      // Arama yoksa popüler içerikleri göster
      setPopularMovies([]);
      setLoading(true);
      
      if (tab === 'movie') {
       try {
    const [moviesData, booksData] = await Promise.all([
      getPopularMovies(),
      getTopRatedBooks()
    ]);
    setResults(moviesData.movies || []);
    setTopBooks(booksData.results || []);
  } catch (error) {
    console.error('İçerikler yüklenemedi:', error);
    setResults([]);
    setTopBooks([]);
  }
      } else if (tab === 'book') {
        try {
          const data = await getTopRatedBooks();
          setResults(data.results || []);
        } catch (error) {
          console.error('Kitaplar yüklenemedi:', error);
          setResults([]);
        }
      } else {
        // Tümü - Filmler göster
        try {
          const data = await getPopularMovies();
          setResults(data.movies || []);
        } catch (error) {
          console.error('Filmler yüklenemedi:', error);
          setResults([]);
        }
      }
      
      setLoading(false);
    }
  };

  // İlk yüklemede popüler filmleri göster
useEffect(() => {
  if (!queryParam) {
    const loadInitialContent = async () => {
      setLoading(true);
      try {
        const [moviesData, booksData] = await Promise.all([
          getPopularMovies(),
          getTopRatedBooks()
        ]);
        setResults(moviesData.movies || []);
        setTopBooks(booksData.results || []);
      } catch (error) {
        console.error('İlk yükleme hatası:', error);
        setResults([]);
        setTopBooks([]);
      }
      setLoading(false);
    };
    
    loadInitialContent();
  }
}, []); // Boş bağımlılık - sadece ilk mount'ta çalışır
  // Filtrelenmiş sonuçlar
  const filteredResults = results.filter(item => {
    if (filterYear && item.year && item.year.toString() !== filterYear.toString()) {
      return false;
    }
    
    if (filterRating && (!item.vote_average || item.vote_average < parseFloat(filterRating))) {
      return false;
    }
    
    if (filterGenre && filterGenre.trim()) {
      if (item.genres && Array.isArray(item.genres)) {
        const hasGenre = item.genres.some(g => 
          g.toLowerCase().includes(filterGenre.toLowerCase())
        );
        if (!hasGenre) return false;
      }
      else if (item.categories && Array.isArray(item.categories)) {
        const hasGenre = item.categories.some(c => 
          c.toLowerCase().includes(filterGenre.toLowerCase())
        );
        if (!hasGenre) return false;
      }
      else {
        return false;
      }
    }
    
    return true;
  });

  // DEBUG - Sadece filtre değişince yazdır
if (filterGenre === 'Aksiyon' || filterGenre === 'Kurgu') {
  console.log('📊 Filtreleme Durumu:');
  console.log('activeTab:', activeTab);
  console.log('filterGenre:', filterGenre);
  console.log('results.length:', results.length);
  console.log('filteredResults.length:', filteredResults.length);
  
  // İlk 2 filmin/kitabın türlerini göster
  if (results.length > 0) {
    console.log('🎬 İLK FİLM:');
    console.log('Title:', results[0].title);
    console.log('Type:', results[0].type);
    console.log('Genres:', results[0].genres);
    console.log('Categories:', results[0].categories);
    
    if (results.length > 1) {
      console.log('🎬 İKİNCİ FİLM:');
      console.log('Title:', results[1].title);
      console.log('Genres:', results[1].genres);
    }
  }
}

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🔍 Keşfet
          </h1>
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Film veya kitap ara..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none"
              />

              <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              >
                Ara
              </button>
            </div>
          </form>

          {/* Filtreler - Sadece arama varsa göster */}
          {searchQuery.trim() && results.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">🔍 Filtrele</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yıl
                  </label>
                  <input
                    type="number"
                    placeholder="Örn: 2020"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tür
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Action, Drama"
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min. Puan
                  </label>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="">Tümü</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                    <option value="6">6+</option>
                    <option value="7">7+</option>
                    <option value="8">8+</option>
                    <option value="9">9+</option>
                  </select>
                </div>
              </div>

              {(filterYear || filterGenre || filterRating) && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results.length - filteredResults.length} sonuç filtrelendi
                  </p>
                  <button
                    onClick={() => {
                      setFilterYear('');
                      setFilterGenre('');
                      setFilterRating('');
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                  >
                    ✖ Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => handleTabChange('movie')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'movie'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🎬 Filmler
            </button>
            <button
              onClick={() => handleTabChange('book')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'book'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📚 Kitaplar
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}

        {!loading && (filteredResults.length > 0 || results.length > 0) && (
          <div>
    {/* Filmler Bölümü */}
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {searchQuery.trim()
          ? `Arama Sonuçları (${filteredResults.length})`
          : activeTab === 'book'
          ? '📚 En Yüksek Puanlı Kitaplar'
          : activeTab === 'all'
          ? '🔥 Popüler Filmler'
          : '🔥 Popüler Filmler'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredResults.map((item, index) => (
          <ContentCard key={`${item.external_id}-${index}`} content={item} />
        ))}
      </div>
    </div>

    {/* Kitaplar Bölümü - Sadece "Tümü" sekmesinde */}
    {activeTab === 'all' && !searchQuery.trim() && topBooks.length > 0 && (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          📚 En Yüksek Puanlı Kitaplar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topBooks.map((item, index) => (
            <ContentCard key={`book-${item.external_id}-${index}`} content={item} />
          ))}
        </div>
      </div>
    )}
  </div>
        )}

        {!loading && filteredResults.length === 0 && results.length > 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">
              Filtrelere uygun sonuç bulunamadı
            </p>
            <button
              onClick={() => {
                setFilterYear('');
                setFilterGenre('');
                setFilterRating('');
              }}
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {!loading && !searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Arama yapmak için yukarıdaki kutucuğu kullan
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ContentCard({ content }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/content/${content.type}/${content.external_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
    >
      {content.poster_url ? (
        <img
          src={content.poster_url}
          alt={content.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-4xl">
            {content.type === 'movie' ? '🎬' : '📚'}
          </span>
        </div>
      )}

      <div className="p-3">
        <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 mb-1">
          {content.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{content.year || 'N/A'}</span>
          <span>{content.type === 'movie' ? '🎬' : '📚'}</span>
        </div>
        {content.vote_average > 0 && (
          <div className="mt-2 flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              {content.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;