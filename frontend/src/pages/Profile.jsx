import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserLibrary, followUser, unfollowUser, checkFollowStatus } from '../services/userService';
import { getUserActivities } from '../services/activityService';
import ActivityCard from '../components/ActivityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import UserAvatar from '../components/UserAvatar';
import { showSuccess, showError ,showInfo} from '../utils/toast';

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [library, setLibrary] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Profil bilgileri
      const profileData = await getUserProfile(userId);
      setProfile(profileData.user);
      
      // Kütüphane
      const libraryData = await getUserLibrary(userId);
      setLibrary(libraryData.library || []);
      
      // Aktiviteler
      const activitiesData = await getUserActivities(userId);
      setActivities(activitiesData.activities || []);
      
      // Takip durumu (başkasının profili ise)
      if (!isOwnProfile) {
        const followStatus = await checkFollowStatus(userId);
        setIsFollowing(followStatus.isFollowing);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
      setLoading(false);
    }
  };

  loadProfile();
}, [userId, isOwnProfile]);

const loadActivities = async () => {
  setActivitiesLoading(true);
  try {
    const data = await getUserActivities(userId);
    setActivities(data.activities || []);
  } catch (error) {
    console.error('Aktiviteler yüklenemedi:', error);
    setActivities([]);
  }
  setActivitiesLoading(false);
};

const handleTabChange = (tab) => {
  setActiveTab(tab);
  if (tab === 'activities') {
    loadActivities();
  }
};

 

const handleFollowToggle = async () => {
  try {
    setFollowLoading(true);
    
    if (isFollowing) {
      await unfollowUser(userId);
      setIsFollowing(false);
      showInfo('Takibi bıraktınız');
    } else {
      await followUser(userId);
      setIsFollowing(true);
      showSuccess('Takip ediyorsunuz! 🎉');
    }
    
    setFollowLoading(false);
  } catch (error) {
    showError('Hata: ' + error);
    setFollowLoading(false);
  }
};

  const getFilteredLibrary = () => {
    if (libraryFilter === 'all') return library;
    return library.filter(item => item.status === libraryFilter);
  };

 // İstatistikler - Library'den hesapla
const stats = {
  watched: library.filter(item => item.status === 'watched').length,
  to_watch: library.filter(item => item.status === 'to_watch').length,
  read: library.filter(item => item.status === 'read').length,
  to_read: library.filter(item => item.status === 'to_read').length,
  total: library.length
};

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Profil yükleniyor..." />
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Kullanıcı bulunamadı</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <UserAvatar user={profile} size="xl" />

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {profile.username}
                </h1>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                    }`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  </button>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.email}</p>

              {/* Biyografi - */}
              {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto italic">
             "{profile.bio}"
            </p>
            )}

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam</div>
                </div>
  
                {/* Takipçiler */}
                <button
                  onClick={() => navigate(`/follow/${userId}/followers`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition"
                >
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.followers_count || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Takipçi</div>
                </button>
  
                {/* Takip Edilenler */}
                <button
                  onClick={() => navigate(`/follow/${userId}/following`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition"
                >
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.following_count || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Takip</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'library'
                ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            📚 Kütüphane ({stats.total})
          </button>
          <button
  onClick={() => handleTabChange('activities')}
  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
    activeTab === 'activities'
      ? 'bg-blue-600 dark:bg-blue-700 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
  }`}
>
   Son Aktiviteler
</button>
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div>
            {/* Library Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setLibraryFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'all'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📚 Tümü ({stats.total})
              </button>
              <button
                onClick={() => setLibraryFilter('watched')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'watched'
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🎬 İzledim ({stats.watched})
              </button>
              <button
                onClick={() => setLibraryFilter('to_watch')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'to_watch'
                    ? 'bg-yellow-500 dark:bg-yellow-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📺 İzlenecek ({stats.to_watch})
              </button>
              <button
                onClick={() => setLibraryFilter('read')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'read'
                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📖 Okudum ({stats.read})
              </button>
              <button
                onClick={() => setLibraryFilter('to_read')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'to_read'
                    ? 'bg-pink-600 dark:bg-pink-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📚 Okunacak ({stats.to_read})
              </button>
            </div>

            {/* Library Grid */}
            {getFilteredLibrary().length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getFilteredLibrary().map((item) => (
                  <LibraryCard key={item.id} item={item} navigate={navigate} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📚"
                title="Bu kategoride içerik yok"
                description="Keşfet sayfasından film ve kitap ekleyebilirsin!"
                actionText="Keşfet"
                onAction={() => navigate('/explore')}
              />
            )}
          </div>
        )}

        
        {activeTab === 'activities' && (
  <div>
    {activitiesLoading ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    ) : activities.length > 0 ? (
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard 
            key={activity.id} 
            activity={activity}
            hideActions={true}  // ← EKLE
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-6xl mb-4">⚡</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Henüz aktivite yok
        </p>
      </div>
    )}
  </div>
)}
      </div>
    </Layout>
  );
}

// Library Card Component
function LibraryCard({ item, navigate }) {
  const content = item.content;

  const handleClick = () => {
    navigate(`/content/${content.type}/${content.external_id}`);
  };

  const getStatusBadge = () => {
    const badges = {
      watched: { text: 'İzledim', color: 'bg-green-500' },
      to_watch: { text: 'İzlenecek', color: 'bg-yellow-500' },
      read: { text: 'Okudum', color: 'bg-purple-500' },
      to_read: { text: 'Okunacak', color: 'bg-pink-500' }
    };
    
    const badge = badges[item.status] || { text: item.status, color: 'bg-gray-500' };
    
    return (
      <span className={`absolute top-2 right-2 ${badge.color} text-white text-xs px-2 py-1 rounded-full shadow-lg z-10`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
    >
      {getStatusBadge()}
      
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
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2">
          {content.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {content.year || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default Profile;