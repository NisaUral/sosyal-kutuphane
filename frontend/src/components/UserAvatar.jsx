import { useState } from 'react';

function UserAvatar({ user, size = 'md' }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Avatar URL belirleme
  const getAvatarUrl = () => {
    if (user?.avatar_url && user.avatar_url !== '' && user.avatar_url !== null) {
      return user.avatar_url;
    }
    return '/default-avatar.png';
  };

  const avatarUrl = getAvatarUrl();

  // Resim yüklenemezse gradient göster
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-gray-200 dark:border-gray-600`}
      >
        {getInitials(user?.username)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={user?.username || 'User'}
      onError={() => setImageError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-600`}
    />
  );
}

export default UserAvatar;