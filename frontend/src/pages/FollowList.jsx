import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UserAvatar from '../components/UserAvatar';
import { getFollowers, getFollowing } from '../services/userService';

function FollowList() {
  const { userId, type } = useParams();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        
        if (type === 'followers') {
          const data = await getFollowers(userId);
          setUsers(data.followers || []);
        } else {
          const data = await getFollowing(userId);
          setUsers(data.following || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Liste yüklenemedi:', error);
        setLoading(false);
      }
    };

    loadUsers();
  }, [userId, type]);

  const handleUserClick = (user) => {
    navigate(`/profile/${user.id}`);
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

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {type === 'followers' ? '👥 Takipçiler' : '👤 Takip Edilenler'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {users.length} kullanıcı
          </p>
        </div>

        {/* User List */}
        {users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <UserAvatar user={user} size="lg" />

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <svg
                    className="h-6 w-6 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 dark:text-gray-400">
              {type === 'followers' 
                ? 'Henüz takipçi yok'
                : 'Henüz kimseyi takip etmiyor'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default FollowList;