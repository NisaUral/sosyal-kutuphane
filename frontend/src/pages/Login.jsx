import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null); // 'email' veya 'password'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Giriş başarısız!');
      }

      login(response.user, response.token);
      navigate('/feed');
      
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 backdrop-blur-sm bg-opacity-95">
        
        {/* Animated Eyes */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-20">
            {/* Left Eye */}
            <div className="absolute left-4 top-0 w-12 h-12 bg-white rounded-full border-4 border-gray-800 overflow-hidden">
              <div 
                className={`absolute w-6 h-6 bg-gray-900 rounded-full transition-all duration-300 ${
                  focusedInput === 'email' 
                    ? 'top-6 left-3' 
                    : focusedInput === 'password'
                    ? 'top-1 left-3'
                    : 'top-3 left-3'
                }`}
              >
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Right Eye */}
            <div className="absolute right-4 top-0 w-12 h-12 bg-white rounded-full border-4 border-gray-800 overflow-hidden">
              <div 
                className={`absolute w-6 h-6 bg-gray-900 rounded-full transition-all duration-300 ${
                  focusedInput === 'email' 
                    ? 'top-6 left-3' 
                    : focusedInput === 'password'
                    ? 'top-1 left-3'
                    : 'top-3 left-3'
                }`}
              >
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Sosyal Kütüphane
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none"
              placeholder="ornek@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Şifremi Unuttum */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Şifremi Unuttum
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;