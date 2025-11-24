import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
//import { updateProfile } from '../services/userService';
import UserAvatar from '../components/UserAvatar';
import { showSuccess, showError } from '../utils/toast';
import { updateProfile, uploadAvatar } from '../services/userService'; // ← uploadAvatar ekle

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
  const [avatarFile, setAvatarFile] = useState(null); // ← YENİ
const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || ''); // ← YENİ
const [uploadingAvatar, setUploadingAvatar] = useState(false); // ← YENİ

  // User değişince formu güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || ''
      });
      setAvatarPreview(user.avatar_url || ''); // ← YENİ
    }
  }, [user]);

// Avatar dosyası seçildiğinde
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Dosya boyutu 5MB\'dan küçük olmalı!');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showError('Sadece resim dosyaları yüklenebilir!');
      return;
    }

    setAvatarFile(file);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Avatar yükle
const handleUploadAvatar = async () => {
  if (!avatarFile) {
    showError('Lütfen bir dosya seçin!');
    return;
  }

  setUploadingAvatar(true);
  try {
    const response = await uploadAvatar(avatarFile);
    updateUser(response.user);
    showSuccess('Avatar yüklendi! ✅');
    setAvatarFile(null);
  } catch (error) {
    showError('Hata: ' + error.message);
  }
  setUploadingAvatar(false);
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      showError('Kullanıcı adı gerekli!');
      return;
    }

    if (!formData.email.trim()) {
      showError('Email gerekli!');
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

           {/* Avatar Yükleme Bölümü */}
<div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
    📸 Profil Fotoğrafı
  </h2>
  
  <div className="flex flex-col md:flex-row items-center gap-6">
    {/* Avatar Önizleme */}
    <div className="text-center">
      <UserAvatar 
        user={{ ...user, avatar_url: avatarPreview }} 
        size="2xl" 
      />
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Mevcut Avatar
      </p>
    </div>

    {/* Dosya Seçici */}
    <div className="flex-1 w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="w-full text-sm text-gray-600 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          dark:file:bg-blue-900 dark:file:text-blue-300
          hover:file:bg-blue-100 dark:hover:file:bg-blue-800
          file:cursor-pointer cursor-pointer"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        PNG, JPG, GIF veya WEBP (Max. 5MB)
      </p>

      {avatarFile && (
        <button
          type="button"
          onClick={handleUploadAvatar}
          disabled={uploadingAvatar}
          className="mt-4 w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold disabled:opacity-50"
        >
          {uploadingAvatar ? 'Yükleniyor...' : 'Avatar\'ı Kaydet'}
        </button>
      )}
    </div>
  </div>
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