import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserLists, createList, deleteList } from '../services/listService';
import { showError, showInfo } from '../utils/toast';

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
      showError('Liste adı gerekli!');
      return;
    }
    
    setCreating(true);
    try {
      await createList(newListName, newListDescription);
      showInfo('Liste oluşturuldu! 📝');
      setNewListName('');
      setNewListDescription('');
      setShowCreateModal(false);
      loadLists();
    } catch (error) {
      showError('Hata: ' + error);
    }
    setCreating(false);
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`"${listName}" listesini silmek istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      await deleteList(listId);
      showInfo('Liste silindi!');
      loadLists();
    } catch (error) {
      showError('Hata: ' + error);
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white"> Listelerim</h1>
            <p className="text-gray-600 dark:text-gray-400">Özel koleksiyonlarını oluştur</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold"
          >
             Yeni Liste
          </button>
        </div>

        {/* Listeler */}
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition transition border border-gray-200 dark:border-gray-700"
              >
                <div 
                  onClick={() => navigate(`/lists/${list.id}`)}
                  className="cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2 dark:text-white mb-2">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {list.description}
                    </p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                     {list.item_count || 0} içerik
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id, list.name);
                  }}
                  className="mt-4 w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition text-sm"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center dark:border-gray-700">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Henüz liste yok</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              İlk Listeni Oluştur
            </button>
          </div>
        )}

        {/* Create Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            📝 Yeni Liste Oluştur
          </h2>
          
          <form onSubmit={handleCreateList}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Liste Adı *
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Örn: En İyi Filmlerim"
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
                maxLength="100"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Liste hakkında..."
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
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
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creating || !newListName.trim()}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
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