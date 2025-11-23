import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  console.log('🛡️ ProtectedRoute çalıştı - User:', user);

  if (!user) {
    console.log('❌ User yok, /login\'e yönlendiriliyor');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User var, children render ediliyor');
  return children;
}

export default ProtectedRoute;