import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSuggestedUsers, followUser, searchUsers } from '../services/userService';
import { showError, showSuccess } from '../utils/toast';

function DiscoverUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  // Önerilen kullanıcıları yükle
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestedUsers();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Öneriler yüklenemedi:', error);
    }
    setLoading(false);
  };

  // Arama yap
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchUsers(query);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Arama hatası:', error);
      showError('Arama yapılamadı!');
    }
    setLoading(false);
  };

  // Takip et
  const handleFollow = async (userId) => {
    setFollowLoading({ ...followLoading, [userId]: true });
    try {
      await followUser(userId);
      showSuccess('Takip ediyorsunuz!');
      
      // Listeyi yenile
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        loadSuggestions();
      }
    } catch (error) {
      showError('Hata: ' + error);
    }
    setFollowLoading({ ...followLoading, [userId]: false });
  };

  // İlk yükleme
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Arama debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayUsers = searchQuery.trim() ? searchResults : suggestions;

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
             Kullanıcıları Keşfet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Yeni insanlar bul ve takip et
          </p>
        </div>

        {/* Arama Kutusu */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=" Kullanıcı ara..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none"
          />
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner text="Yükleniyor..." />}

        {/* Kullanıcı Listesi */}
        {!loading && displayUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/profile/${user.id}`}>
                    <UserAvatar user={user} size="lg" />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${user.id}`}
                      className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition truncate block"
                    >
                      {user.username}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.followers_count} takipçi
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Takip Butonu */}
                {!user.is_following && (
                  <button
                    onClick={() => handleFollow(user.id)}
                    disabled={followLoading[user.id]}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold disabled:opacity-50"
                  >
                    {followLoading[user.id] ? '...' : '➕ Takip Et'}
                  </button>
                )}
                
                {user.is_following && (
                  <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-center font-semibold">
                    ✅ Takip Ediliyor
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Boş Durum */}
        {!loading && displayUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {searchQuery.trim() ? 'Kullanıcı Bulunamadı' : 'Henüz Öneri Yok'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery.trim() 
                ? 'Farklı bir isim deneyin' 
                : 'Yeni kullanıcılar katıldığında burada görünecek'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DiscoverUsers;