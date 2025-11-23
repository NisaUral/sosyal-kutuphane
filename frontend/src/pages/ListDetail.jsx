import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentCard from '../components/ContentCard';
import { getListDetails, removeFromList } from '../services/listService';
import { useAuth } from '../context/AuthContext';

function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await getListDetails(listId);
      setList(data.list);
    } catch (error) {
      console.error('Liste yüklenemedi:', error);
      alert('Liste bulunamadı!');
      navigate('/lists');
    }
    setLoading(false);
  };

  const handleRemove = async (contentId, title) => {
    if (!window.confirm(`"${title}" listeden çıkarılsın mı?`)) {
      return;
    }
    
    try {
      await removeFromList(listId, contentId);
      alert('Listeden çıkarıldı!');
      loadList();
    } catch (error) {
      alert('Hata: ' + error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!list) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Liste bulunamadı</p>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === list.user_id;

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {list.name}
              </h1>
              {list.description && (
                <p className="text-gray-600 mb-4">{list.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👤 {list.username}</span>
                <span>📦 {list.items?.length || 0} içerik</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/lists')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              ← Geri
            </button>
          </div>
        </div>

        {/* İçerikler */}
        {list.items && list.items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {list.items.map((item) => (
              <div key={item.id} className="relative">
                <ContentCard content={item} />
                
                {isOwner && (
                  <button
                    onClick={() => handleRemove(item.id, item.title)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                    title="Çıkar"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">Liste boş</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ListDetail;