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
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
  <div className="flex items-start gap-8">
    {/* Sol - Avatar */}
    <div className="flex-shrink-0">
      <div className="ring-4 ring-gray-200 dark:ring-gray-700 rounded-full overflow-hidden">
        <UserAvatar user={profile} size="2xl" />
      </div>
    </div>

    {/* Orta - Bilgiler */}
    <div className="flex-1">
      {/* Kullanıcı Adı */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        {profile.username}
      </h1>
      
      {/* Email - Sadece kendi profilinde göster */}
{isOwnProfile && (
  <p className="text-gray-600 dark:text-gray-400 mb-4">
    {profile.email}
  </p>
)}

      {/* Bio */}
      {profile.bio && (
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-3 max-w-2xl">
          <p className="text-gray-700 dark:text-gray-300 italic">
            "{profile.bio}"
          </p>
        </div>
      )}
    </div>

    {/* Sağ - Stats Kartları */}
    <div className="flex gap-3">
      {/* Toplam */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center min-w-[80px] border-2 border-gray-200 dark:border-gray-600">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Toplam</div>
      </div>

      {/* Takipçiler */}
      <button
        onClick={() => navigate(`/follow/${userId}/followers`)}
        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl p-4 text-center min-w-[80px] border-2 border-gray-200 dark:border-gray-600 transition"
      >
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.followers_count || 0}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Takipçi</div>
      </button>

      {/* Takip */}
      <button
        onClick={() => navigate(`/follow/${userId}/following`)}
        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl p-4 text-center min-w-[80px] border-2 border-gray-200 dark:border-gray-600 transition"
      >
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.following_count || 0}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Takip</div>
      </button>
    </div>
  </div>

  {/* Takip Et Butonu - Alt Kısımda */}
  {!isOwnProfile && (
    <div className="mt-6 flex justify-end">
      <button
        onClick={handleFollowToggle}
        disabled={followLoading}
        className={`px-8 py-2.5 rounded-xl font-semibold transition ${
          isFollowing
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
        }`}
      >
        {followLoading ? '...' : isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
      </button>
    </div>
  )}
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
             Kütüphane ({stats.total})
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
                 Tümü ({stats.total})
              </button>
              <button
                onClick={() => setLibraryFilter('watched')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'watched'
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                 İzledim ({stats.watched})
              </button>
              <button
                onClick={() => setLibraryFilter('to_watch')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'to_watch'
                    ? 'bg-yellow-500 dark:bg-yellow-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                 İzlenecek ({stats.to_watch})
              </button>
              <button
                onClick={() => setLibraryFilter('read')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'read'
                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                 Okudum ({stats.read})
              </button>
              <button
                onClick={() => setLibraryFilter('to_read')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  libraryFilter === 'to_read'
                    ? 'bg-pink-600 dark:bg-pink-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                 Okunacak ({stats.to_read})
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