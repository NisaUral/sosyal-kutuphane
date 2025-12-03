import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify'; // ← EKLE
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import ContentDetail from './pages/ContentDetail';
import MyLists from './pages/MyLists';
import ListDetail from './pages/ListDetail';
import Settings from './pages/Settings';
import FollowList from './pages/FollowList';
import ForgotPassword from './pages/ForgotPassword';  // ← YENİ
import ResetPassword from './pages/ResetPassword';
import DiscoverUsers from './pages/DiscoverUsers';
// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Kullanıcı yok, login\'e yönlendiriliyor');
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (user) {
    console.log('✅ Kullanıcı zaten giriş yapmış, feed\'e yönlendiriliyor');
    return <Navigate to="/feed" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/feed" element={
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      } />

      <Route path="/explore" element={
        <ProtectedRoute>
          <Explore />
        </ProtectedRoute>
      } />

      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/content/:type/:externalId" element={
        <ProtectedRoute>
          <ContentDetail />
        </ProtectedRoute>
      } />

      <Route path="/lists" element={
        <ProtectedRoute>
          <MyLists />
        </ProtectedRoute>
      } />

      <Route path="/lists/:listId" element={
        <ProtectedRoute>
          <ListDetail />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/discover-users" element={
  <ProtectedRoute>
    <DiscoverUsers />
  </ProtectedRoute>
} />

      <Route path="/follow/:userId/:type" element={
        <ProtectedRoute>
          <FollowList />
        </ProtectedRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
          </PublicRoute>
        } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
          </PublicRoute>
        } />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
           <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;