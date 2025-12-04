import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ActivityCard from '../components/ActivityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import UserAvatar from '../components/UserAvatar';
import { getFeed } from '../services/activityService';
import { getSuggestedUsers, followUser } from '../services/userService';
import { showError, showSuccess } from '../utils/toast';

function Feed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [followLoading, setFollowLoading] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  const loadActivities = async (pageNum = 1) => {
  if (pageNum === 1) {
    setLoading(true);
  } else {
    setLoadingMore(true);
  }
  
  try {
    const data = await getFeed(pageNum, 15);  // ← sayfa ve limit parametreleri
    console.log('🎯 getFeed sonucu:', data);  
    if (pageNum === 1) {
      setActivities(data.activities || []);
    } else {
      setActivities(prev => [...prev, ...(data.activities || [])]);
    }
    
    setPage(pageNum);  // ← Sayfa state'ini güncelle
    setTotalPages(data.totalPages || 1);
    setHasMore(pageNum < (data.totalPages || 1));
  } catch (error) {
    console.error('Feed yüklenemedi:', error);
    setActivities([]);
    setHasMore(false);
  }
  
  setLoading(false);
  setLoadingMore(false);
};

  const loadSuggestions = async () => {
    try {
      const data = await getSuggestedUsers();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Öneriler yüklenemedi:', error);
      setSuggestions([]);
    }
  };

  const handleFollow = async (userId) => {
  setFollowLoading({ ...followLoading, [userId]: true });
  try {
    await followUser(userId);
    loadSuggestions(); // Önerileri yenile
    loadActivities(1); // Feed'i yenile
    showSuccess('Takip ediyorsunuz! ');
    
    // Sayfayı yenile (istatistikler güncellensin)
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showError('Hata: ' + error);
  }
  setFollowLoading({ ...followLoading, [userId]: false });
};

  const styles = `
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.5s ease-out;
  }
`;

// Style'ı head'e ekle
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

  useEffect(() => {
    loadActivities(1);
    loadSuggestions();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadActivities(nextPage);
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white"> Ana Sayfa</h1>
          <p className="text-gray-600 dark:text-gray-400">Takip ettiğin kişilerin aktivitelerini gör</p>
        </div>

        {/* İlk yükleme loading */}
        {loading && page === 1 && <LoadingSpinner text="Aktiviteler yükleniyor..." />}

        {/* Aktiviteler */}
{!loading && activities.length > 0 && (
  <div className="flex justify-center">
    <div className="w-full max-w-3xl space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="animate-slide-in"
          style={{
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <ActivityCard activity={activity} />
        </div>
      ))}
    </div>
  </div>
)}
        {/* DEBUG LOG - BURAYA EKLE */}
{console.log('🔍 Buton Debug:', {
  loading,
  hasMore,
  activitiesLength: activities.length,
  page,
  totalPages,
  buttonShouldShow: !loading && hasMore && activities.length > 0
})}

        {/* Daha Fazla Yükle Butonu */}
        {!loading && hasMore && activities.length > 0 && (
  <div className="text-center mt-8">
    <button
  onClick={handleLoadMore}
  disabled={loadingMore}
  className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loadingMore ? (
    <div className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      <span>Yükleniyor...</span>
    </div>
  ) : (
    ' Daha Fazla Yükle'
  )}
</button>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
      Sayfa {page} / {totalPages}
    </p>
  </div>
)}

        {/* Loading (Daha fazla yüklenirken) */}
        {loading && activities.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}

        {/* Boş durum */}
        {!loading && activities.length === 0 && (
          <div>
            <EmptyState
              icon="📭"
              title="Henüz aktivite yok"
              description="Başka kullanıcıları takip etmeye başla!"
            />

            {/* Önerilen Kullanıcılar */}
            {suggestions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  👥 Takip Edebileceğin Kişiler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestedUser) => (
                    <div
                      key={suggestedUser.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Link to={`/profile/${suggestedUser.id}`}>
                          <UserAvatar user={suggestedUser} size="lg" />
                        </Link>
                        <div className="flex-1">
                          <Link
                            to={`/profile/${suggestedUser.id}`}
                            className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            {suggestedUser.username}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {suggestedUser.followers_count} takipçi
                          </p>
                        </div>
                      </div>
                      
                      

                      <button
                        onClick={() => handleFollow(suggestedUser.id)}
                        disabled={followLoading[suggestedUser.id]}
                        className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold disabled:opacity-50"
                      >
                        {followLoading[suggestedUser.id] ? '...' : 'Takip Et'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );

}

export default Feed;