import { Link } from 'react-router-dom';
import { useState } from 'react';
import {  useEffect } from 'react';
import { toggleLike } from '../services/likeService';
import UserAvatar from './UserAvatar';


function ActivityCard({ activity , hideActions = false}) {
  const { user, content, activity_type, rating, review, created_at } = activity;

  const [liked, setLiked] = useState(activity.user_liked || false);
  const [likeCount, setLikeCount] = useState(activity.like_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);

    useEffect(() => {
    setLiked(activity.liked_by_user || false);
    setLikeCount(activity.like_count || 0);
  }, [activity.liked_by_user, activity.like_count]);

  // Zaman farkını hesapla
 const getTimeAgo = (date) => {
 
  
  const dbDate = new Date(date ); 
  const now = new Date();
  
  const seconds = Math.floor((now - dbDate) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' yıl önce';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' ay önce';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' gün önce';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' saat önce';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' dakika önce';
  
  return 'Az önce';
};

  // Aktivite tipine göre metin
  const getActivityText = () => {
    if (activity_type === 'rating') {
      return `${content.type === 'movie' ? 'filme' : 'kitaba'} puan verdi`;
    }
    if (activity_type === 'review') {
      return `${content.type === 'movie' ? 'film' : 'kitap'} hakkında yorum yaptı`;
    }
    
  if (activity.activity_type === 'review') {
    return 'yorum yaptı';
  }
  if (activity.source === 'like') {
    return 'beğendi';  // ← SADECE BU
  }

    
    // Aktivite tipi belirleme
const getActivityText = () => {
  if (activity.source === 'like') {
    return (
      <>
        <strong>{activity.liked_username}</strong> kullanıcısının{' '}
        {activity.liked_activity_type === 'review' ? 'yorumunu' : 'puanını'} beğendi
      </>
    );
  }
  
 

};
    return 'aktivite';
  
  };

  // Beğen/Beğeniyi Kaldır
  const handleLike = async () => {
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      const response = await toggleLike(activity.id);
      
      if (response.liked) {
        setLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
    setLikeLoading(false);
  };

  // Yıldız gösterimi
  const renderStars = (score) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300 dark:text-gray-600">★</span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition border border-gray-200 dark:border-gray-700">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Link to={`/profile/${user.id}`}>
          <UserAvatar user={user} size="md" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Link
              to={`/profile/${user.id}`}
              className="font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {user.username}
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {getActivityText()}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {getTimeAgo(created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex space-x-4">
        
        {/* Poster/Cover */}
        {content.poster_url && (
          <Link to={`/content/${content.type}/${content.external_id}`}>
            <img
              src={content.poster_url}
              alt={content.title}
              className="w-24 h-36 object-cover rounded-lg shadow-md hover:scale-105 transition"
            />
          </Link>
        )}

        {/* Info */}
        <div className="flex-1">
          <Link
            to={`/content/${content.type}/${content.external_id}`}
            className="font-semibold text-lg text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            {content.title}
          </Link>
          
          {content.year && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {content.year} · {content.type === 'movie' ? '🎬 Film' : '📚 Kitap'}
            </p>
          )}

          {/* Rating */}
          {activity_type === 'rating' && rating && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(rating.score)}</div>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {rating.score}/10
                </span>
              </div>
            </div>
          )}


          {/* Review */}
{activity_type === 'review' && review && (
  <div className="mt-2">
    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
      {showFullReview 
        ? review.review_text 
        : review.review_text.length > 150 
          ? review.review_text.substring(0, 150) + '...' 
          : review.review_text
      }
    </p>
    {review.review_text.length > 150 && (
      <button
        onClick={() => setShowFullReview(!showFullReview)}
        className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1 inline-block"
      >
        {showFullReview ? '← Daha az göster' : 'Devamını oku →'}
      </button>
    )}
  </div>
)}
        </div>
      </div>

      {/* Actions */}
      {!hideActions &&(
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {/* Beğen Butonu */}
        <button 
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center space-x-1 transition ${
            liked 
              ? 'text-red-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
          } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg 
            className="h-5 w-5" 
            fill={liked ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <span className="text-sm font-medium">
            {likeCount > 0 ? likeCount : ''} {liked ? 'Beğendin' : 'Beğen'}
          </span>
        </button>
  
        {/* Yorum Butonu */}
        <Link
          to={`/content/${content.type}/${content.external_id}`}
          className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">Yorum Yap</span>
        </Link>
      </div>
      )}
      
    </div>
  );
}

export default ActivityCard;