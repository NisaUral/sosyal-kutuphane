import { useState } from 'react'; // ← EKLE

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

function UserAvatar({ user, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false); // ← YENİ

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
    '2xl': 'w-32 h-32 text-5xl'
  };

  const getAvatarUrl = () => {
    if (user?.avatar_url) {
      // Eğer /uploads ile başlıyorsa backend URL'i ekle
      if (user.avatar_url.startsWith('/uploads/')) {
        return `${API_URL}${user.avatar_url}`;
      }
      return user.avatar_url;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  // Avatar varsa ve hata yoksa resmi göster
  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.username || 'User'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => {
          console.error('Avatar yükleme hatası:', avatarUrl);
          setImageError(true); // ← Hata olunca state değiştir
        }}
      />
    );
  }

  // Avatar yoksa veya hata varsa ilk harf avatar
  const initial = user?.username ? user.username[0].toUpperCase() : '?';
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${className}`}>
      {initial}
    </div>
  );
}

export default UserAvatar;