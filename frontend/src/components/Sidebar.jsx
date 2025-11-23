import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
//import { getUserLibrary } from '../services/userService';
import {  getUserLibrary,getSuggestedUsers, followUser ,getUserStats} from '../services/userService';
import UserAvatar from './UserAvatar';

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    watched: 0,
    read: 0,
    total: 0
  });
  const [isOpen, setIsOpen] = useState(true);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
const [suggestions, setSuggestions] = useState([]);
const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserStats(user.id);
      setStats(data.stats || {
        followers: 0,
        following: 0,
        watched: 0,
        read: 0,
        total: 0
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
      // Fallback: API'den profil bilgisi al
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setStats({
          followers: data.user?.followers_count || 0,
          following: data.user?.following_count || 0,
          watched: 0,
          read: 0,
          total: 0
        });
      } catch (fallbackError) {
        console.error('Fallback stats hatası:', fallbackError);
      }
    }
  };
  
  loadStats();
}, [user]);

  const loadSuggestions = async () => {
  try {
    const data = await getSuggestedUsers();
    setSuggestions(data.suggestions || []);
  } catch (error) {
    console.error('Öneriler yüklenemedi:', error);
    setSuggestions([]);
  }
};

const handleFollowInModal = async (userId) => {
  setFollowLoading({ ...followLoading, [userId]: true });
  try {
    await followUser(userId);
    
    // Önerileri yenile
    await loadSuggestions();
    
    // Stats'ı yenile
    try {
      const data = await getUserStats(user.id);
      setStats(data.stats);
    } catch (statsError) {
      console.error('Stats güncellenemedi:', statsError);
    }
    
    alert('Takip ediyorsunuz! 🎉');
  } catch (error) {
    alert('Hata: ' + error);
  }
  setFollowLoading({ ...followLoading, [userId]: false });
};

const openSuggestionsModal = () => {
  setShowSuggestionsModal(true);
  loadSuggestions();
};

  const menuItems = [
    // ... (menuItems içeriğin aynı, burayı kısalttım) ...
    {
      name: 'Ana Sayfa',
      path: '/feed',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Keşfet',
      path: '/explore',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: 'Kütüphanem',
      path: `/profile/${user?.id}`,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Listelerim',
      path: '/lists',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];


  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* --- YENİ DÜZEN ---
        1. "Pusher": Sayfa akışında kalan, içeriği iten boş div. (Sadece Desktop)
        2. "Sidebar (Aside)": Sayfa akışından çıkan, 'fixed' (sabit) kutu.
        3. "Button": Sayfa akışından çıkan, 'fixed' (sabit) ok.
        4. "Overlay": Mobil için 'fixed' (sabit) arka plan.
      */}

      {/* 1. İTİCİ (PUSHER) DIV (Sadece Desktop) */}
      <div
        className={`
          hidden md:block md:sticky top-16 h-[calc(100vh-4rem)]
          flex-shrink-0 transition-all duration-300
          {/* Bu boş div, 'isOpen' durumuna göre içeriği iter */}
          ${isOpen ? 'w-64' : 'w-0'}
        `}
      />

      {/* 2. SIDEBAR (ASIDE) (Artık 'fixed') */}
      <aside 
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)]
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 z-40
          
          {/* 'fixed' olduğu için 'sticky' yerine 'translate' yeterli */}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* 'Ok' butonu buradan taşındı */}
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {isOpen && (
            <>
              <hr className="my-6 dark:border-gray-700" />
              {/* Stats */}
              <div className="px-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  İstatistikler
                </h3>
                {/* ... (İstatistiklerin içeriği aynı) ... */}
                <div className="space-y-2 text-sm">
                  <Link 
                    to={`/follow/${user?.id}/followers`}
                    className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition"
                  >
                    <span className="text-gray-600 dark:text-gray-400">Takipçi</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.followers}</span>
                  </Link>
                  <Link 
                    to={`/follow/${user?.id}/following`}
                    className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition"
                  >
                    <span className="text-gray-600 dark:text-gray-400">Takip</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{stats.following}</span>
                  </Link>
                  
                </div>
              </div>
              {/* Quick Actions */}
              <div className="mt-6 px-4">
  <button
    onClick={openSuggestionsModal}
    className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-md"
  >
    ✨ Yeni Kişiler Keşfet
  </button>
</div>
            </>
          )}
        </div>
      </aside>

      {/* 3. 'OK' BUTONU (Artık 'fixed') */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          hidden md:block  /* Sadece desktop'ta görünür */
          fixed           /* 'sticky' değil, 'fixed' */
          left-0          /* Sol kenara sabitle */
          top-20          /* Yukarıdan boşluk */
          bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700
          p-2 rounded-r-lg shadow-lg
          transition-transform duration-300 
          z-50            /* Sidebar'ın (z-40) üzerinde görünmesi için */
          
          ${isOpen ? 'translate-x-64' : 'translate-x-0'}
        `}
        style={{ top: '5rem' }} // top-16 (4rem) + 1rem boşluk
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* 4. OVERLAY (Mobil) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition md:hidden"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}

      {/* Yeni Kişiler Modal */}
{showSuggestionsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          ✨ Yeni Kişiler Keşfet
        </h3>
        <button
          onClick={() => setShowSuggestionsModal(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
        >
          ×
        </button>
      </div>

      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestedUser) => (
            <div
              key={suggestedUser.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Link 
                  to={`/profile/${suggestedUser.id}`}
                  onClick={() => setShowSuggestionsModal(false)}
                >
                  <UserAvatar user={suggestedUser} size="lg" />
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/profile/${suggestedUser.id}`}
                    onClick={() => setShowSuggestionsModal(false)}
                    className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition block"
                  >
                    {suggestedUser.username}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {suggestedUser.followers_count} takipçi
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleFollowInModal(suggestedUser.id)}
                disabled={followLoading[suggestedUser.id]}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold disabled:opacity-50"
              >
                {followLoading[suggestedUser.id] ? '...' : 'Takip Et'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Şu anda öneri yok.
          </p>
        </div>
      )}
    </div>
  </div>
)}
    </>
  );
}

export default Sidebar;