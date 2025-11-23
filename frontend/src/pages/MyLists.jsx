import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserLists, createList, deleteList } from '../services/listService';

function MyLists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const data = await getUserLists(user.id);
      setLists(data.lists || []);
    } catch (error) {
      console.error('Listeler yüklenemedi:', error);
    }
    setLoading(false);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!newListName.trim()) {
      alert('Liste adı gerekli!');
      return;
    }
    
    setCreating(true);
    try {
      await createList(newListName, newListDescription);
      alert('Liste oluşturuldu! 📝');
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false);
      loadLists();
    } catch (error) {
      alert('Hata: ' + error);
    }
    setCreating(false);
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`"${listName}" listesini silmek istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      await deleteList(listId);
      alert('Liste silindi!');
      loadLists();
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

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📝 Listelerim</h1>
            <p className="text-gray-600">Özel koleksiyonlarını oluştur</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ Yeni Liste
          </button>
        </div>

        {/* Listeler */}
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div 
                  onClick={() => navigate(`/lists/${list.id}`)}
                  className="cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {list.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500">
                    📦 {list.item_count || 0} içerik
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id, list.name);
                  }}
                  className="mt-4 w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 mb-4">Henüz liste yok</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              İlk Listeni Oluştur
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📝 Yeni Liste Oluştur
              </h2>
              
              <form onSubmit={handleCreateList}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste Adı *
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Örn: En İyi Filmlerim"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    maxLength="100"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Liste hakkında..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows="3"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewListName('');
                      setNewListDescription('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newListName.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyLists;