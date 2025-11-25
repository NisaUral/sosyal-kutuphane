import { useState, useEffect } from 'react';
import { useParams , useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { getContentDetails } from '../services/contentService';
import { getReviews } from '../services/reviewService';
import { getUserLists, addToList } from '../services/listService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { addReview, updateReview, deleteReview } from '../services/reviewService';
import { showError, showInfo, showSuccess } from '../utils/toast';

function ContentDetail() {
  const { type, externalId } = useParams();
  const { user } = useAuth();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userLists, setUserLists] = useState([]);
  const [showListModal, setShowListModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    
    const loadData = async () => {
      
      try {
        setLoading(true);
        
        const data = await getContentDetails(type, externalId);
        setContent(data.content);
        
        if (data.content?.id) {
          try {
            const reviewData = await getReviews(data.content.id);
            setReviews(reviewData.reviews || []);
          } catch (reviewError) {
            console.error('Yorumlar yüklenemedi:', reviewError);
            setReviews([]);
          }
        }
        
        if (user?.id) {
          try {
            const listData = await getUserLists(user.id);
            setUserLists(listData.lists || []);
          } catch (listError) {
            console.error('Listeler yüklenemedi:', listError);
            setUserLists([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('İçerik yükleme hatası:', error);
        setLoading(false);
        setContent(null);
      }
    };

    loadData();
  }, [type, externalId, user]);

  const handleRating = async (score) => {
    try {
      await api.post('/ratings', {
        content_id: content.id,
        score: score * 2
      });
      setUserRating(score);
      showSuccess(`${score * 2}/10 puan verdiniz! `);
    } catch (error) {
      showError('Puan verilemedi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddToListClick = async (selectedListId) => {
    try {
      await addToList(selectedListId, content.id);
      showSuccess('Listeye eklendi! ');
      setShowListModal(false);
    } catch (error) {
      showError('Hata: ' + error);
    }
  };

  const handleCreateNewList = async (e) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      showInfo('Liste adı gerekli!');
      return;
    }
    
    setCreatingList(true);
    try {
      const { createList } = await import('../services/listService');
      const response = await createList(newListName, newListDescription);
      
      await addToList(response.listId, content.id);
      
      showSuccess('Liste oluşturuldu ve içerik eklendi! ');
      setNewListName('');
      setNewListDescription('');
      setShowCreateListModal(false);
      setShowListModal(false);
      
      const listData = await getUserLists(user.id);
      setUserLists(listData.lists || []);
    } catch (error) {
      showError('Hata: ' + error);
    }
    setCreatingList(false);
  };

  const handleOpenListModal = () => {
    if (userLists.length === 0) {
      setShowCreateListModal(true);
    } else {
      setShowListModal(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      await api.post('/reviews', {
        content_id: content.id,
        review_text: reviewText
      });
      
      setReviewText('');
      showSuccess('Yorum eklendi! ');
      
      const reviewData = await getReviews(content.id);
      setReviews(reviewData.reviews || []);
    } catch (error) {
      showError('Yorum eklenemedi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddToLibrary = async (status) => {
    try {
      await api.post('/library', {
        content_id: content.id,
        status: status
      });
      showSuccess('Kütüphaneye eklendi! ');
    } catch (error) {
      showError('Eklenemedi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditReview = (review) => {
  console.log('✏️ Düzenleme başlatıldı:', review);
  setEditingReviewId(review.id);
  setEditingReviewText(review.review_text);
  setShowEditModal(true);
  console.log('Modal açılıyor:', { id: review.id, text: review.review_text });
};

const handleUpdateReview = async () => {
  if (!editingReviewText.trim()) {
    showError('Yorum boş olamaz!');
    return;
  }

  try {
    await updateReview(editingReviewId, editingReviewText);
    
    // Yorumları yenile
    const data = await getReviews(content.id);
    setReviews(data.reviews || []);
    
    setShowEditModal(false);
    setEditingReviewId(null);
    setEditingReviewText('');
    
    showSuccess('Yorum güncellendi! ✅');
  } catch (error) {
    showError('Hata: ' + error);
  }
};

const handleDeleteReview = async (reviewId) => {
  if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
    return;
  }

  try {
    await deleteReview(reviewId);
    
    // Yorumları yenile
    const data = await getReviews(content.id);
    setReviews(data.reviews || []);
    
    showSuccess('Yorum silindi! ');
  } catch (error) {
    showError('Hata: ' + error);
  }
};

// Tarih formatı helper
const formatDate = (dateString) => {
  console.log('🕐 formatDate çağrıldı, gelen değer:', dateString, 'tip:', typeof dateString);
  
  try {
    if (!dateString) {
      console.log('⚠️ Tarih yok!');
      return 'Az önce';
    }
    
    const date = new Date(dateString);
    console.log('📅 Parse edilen tarih:', date);
    console.log('📅 Tarih geçerli mi:', !isNaN(date.getTime()));
    
    if (isNaN(date.getTime())) {
      console.log('❌ Geçersiz tarih formatı!');
      return 'Az önce';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    console.log('⏱️ Fark:', { diffMins, diffHours, diffDays });
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('❌ formatDate hatası:', error);
    return 'Az önce';
  }
};

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">İçerik bulunamadı</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="md:w-1/3">
              {content.poster_url ? (
                <img
                  src={content.poster_url}
                  alt={content.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">
                    {content.type === 'movie' ? '🎬' : '📚'}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {content.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
                <span>{content.year}</span>
                <span>•</span>
                <span>{content.type === 'movie' ? '🎬 Film' : '📚 Kitap'}</span>
                {content.runtime && (
                  <>
                    <span>•</span>
                    <span>{content.runtime} dk</span>
                  </>
                )}
                {content.page_count && (
                  <>
                    <span>•</span>
                    <span>{content.page_count} sayfa</span>
                  </>
                )}
              </div>

              {/* Director/Author */}
              {content.director && (
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Yönetmen:</span> {content.director}
                </p>
              )}
              {content.author && (
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Yazar:</span> {content.author}
                </p>
              )}

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-6">{content.description}</p>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Puanla:</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition"
                    >
                      <span
                        className={
                          star <= (hoverRating || userRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Library Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {content.type === 'movie' ? (
                  <>
                    <button
                      onClick={() => handleAddToLibrary('watched')}
                      className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
                    >
                      ✓ İzledim
                    </button>
                    <button
                      onClick={() => handleAddToLibrary('to_watch')}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    >
                      + İzlenecek
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleAddToLibrary('read')}
                      className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
                    >
                      ✓ Okudum
                    </button>
                    <button
                      onClick={() => handleAddToLibrary('to_read')}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    >
                      + Okunacak
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleOpenListModal}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition"
                >
                  📝 Listeye Ekle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            💬 Yorumlar ({reviews.length})
          </h2>

          {/* Add Review */}
          <form onSubmit={handleReviewSubmit} className="mb-6">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none resize-none"
              rows="4"
              required
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Yorum Yap
            </button>
          </form>

          {/* Reviews List */}
           <div className="space-y-4 mb-6">
    {reviews.map((review) => (
      <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <UserAvatar user={review} size="md" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link
                  to={`/profile/${review.user_id}`}
                  className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {review.username}
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                {review.review_text}
              </p>
            </div>
          </div>

          {/* Düzenle/Sil Butonları - Sadece kendi yorumunda */}
          {user && review.user_id === user.id && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEditReview(review)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold"
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold"
              >
                🗑️ Sil
              </button>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>


          {reviews.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </p>
          )}
        </div>
      </div>

      {/* Liste Seçim Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📝 Listeye Ekle
            </h3>
            
            <div className="space-y-2 mb-4">
              {userLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToListClick(list.id)}
                  className="w-full text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-4 rounded-lg transition"
                >
                  <div className="font-semibold text-gray-800 dark:text-white">{list.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {list.item_count || 0} içerik
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowListModal(false);
                setShowCreateListModal(true);
              }}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition mb-2"
            >
              ➕ Yeni Liste Oluştur
            </button>
            
            <button
              onClick={() => setShowListModal(false)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Yeni Liste Oluşturma Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📝 Yeni Liste Oluştur
            </h3>
            
            <form onSubmit={handleCreateNewList}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Liste Adı *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Örn: En İyi Filmlerim"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  maxLength="100"
                  autoFocus
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Liste hakkında..."
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  rows="3"
                  maxLength="500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateListModal(false);
                    setNewListName('');
                    setNewListDescription('');
                    if (userLists.length > 0) {
                      setShowListModal(true);
                    }
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {userLists.length > 0 ? '← Geri' : 'İptal'}
                </button>
                <button
                  type="submit"
                  disabled={creatingList || !newListName.trim()}
                  className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingList ? 'Oluşturuluyor...' : 'Oluştur ve Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          ✏️ Yorumu Düzenle
        </h3>
        <button
          onClick={() => {
            setShowEditModal(false);
            setEditingReviewId(null);
            setEditingReviewText('');
          }}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
        >
          ×
        </button>
      </div>

      <textarea
        value={editingReviewText}
        onChange={(e) => setEditingReviewText(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
        rows="6"
        placeholder="Yorumunuzu düzenleyin..."
      />

      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={() => {
            setShowEditModal(false);
            setEditingReviewId(null);
            setEditingReviewText('');
          }}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          İptal
        </button>
        <button
          onClick={handleUpdateReview}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Güncelle
        </button>
      </div>
    </div>
  </div>
)}

    </Layout>
  );
}

export default ContentDetail;