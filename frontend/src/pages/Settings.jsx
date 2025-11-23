import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import UserAvatar from '../components/UserAvatar';

function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    bio: user?.bio || ''
  });
  
  const [loading, setLoading] = useState(false);

  // User değişince formu güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert('Kullanıcı adı gerekli!');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email gerekli!');
      return;
    }

    setLoading(true);
    try {
      // updateProfile fonksiyonunu 4 parametre ile çağır
      const response = await updateProfile(
        formData.username, 
        formData.email, 
        formData.avatar_url,
        formData.bio  // ← YENİ
      );
      
      // AuthContext'i güncelle
      updateUser(response.user);
      
      alert('Profil güncellendi! ✅');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      alert('Hata: ' + error);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">⚙️ Profil Ayarları</h1>
            <p className="text-gray-600 dark:text-gray-400">Profil bilgilerinizi güncelleyin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Önizleme */}
            <div className="flex justify-center">
              <div className="text-center">
                <UserAvatar user={{ ...user, avatar_url: formData.avatar_url }} size="2xl" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Avatar Önizleme
                </p>
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Görsel URL'si girin veya boş bırakın (ilk harf avatar kullanılır)
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kullanıcı Adı *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
                maxLength="50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            </div>

            {/* Biyografi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Biyografi
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Kendinden bahset..."
                rows="4"
                maxLength="500"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none resize-none"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 karakter
              </p>
            </div>

            
            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;