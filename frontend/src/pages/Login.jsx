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
  const [focusedInput, setFocusedInput] = useState(null);

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
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Animated Sparkles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Işıltılı Noktalar */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-twinkle"></div>
        <div className="absolute top-40 left-40 w-1 h-1 bg-gray-300 rounded-full animate-twinkle animation-delay-1000"></div>
        <div className="absolute top-60 left-60 w-2 h-2 bg-white rounded-full animate-twinkle animation-delay-2000"></div>
        <div className="absolute top-80 right-40 w-1 h-1 bg-gray-400 rounded-full animate-twinkle animation-delay-3000"></div>
        <div className="absolute bottom-40 right-60 w-2 h-2 bg-white rounded-full animate-twinkle animation-delay-4000"></div>
        <div className="absolute bottom-60 left-80 w-1 h-1 bg-gray-300 rounded-full animate-twinkle animation-delay-5000"></div>
        
        {/* Işık Huzmeleri */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-gray-400/10 to-transparent animate-shimmer"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-shimmer animation-delay-2000"></div>
        
        {/* Büyük Glow Efektleri */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-3000"></div>
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect Behind Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-slate-300 rounded-3xl blur-3xl opacity-30"></div>
        
        {/* White Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          
          {/* Animated Eyes */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-20">
              {/* Left Eye */}
              <div className="absolute left-4 top-0 w-12 h-12 bg-gray-50 rounded-full border-4 border-gray-700 overflow-hidden shadow-lg">
                <div 
                  className={`absolute w-6 h-6 bg-gradient-to-br from-gray-800 to-slate-900 rounded-full transition-all duration-300 ${
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
              <div className="absolute right-4 top-0 w-12 h-12 bg-gray-50 rounded-full border-4 border-gray-700 overflow-hidden shadow-lg">
                <div 
                  className={`absolute w-6 h-6 bg-gradient-to-br from-gray-800 to-slate-900 rounded-full transition-all duration-300 ${
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-black-700 to-slate-800 bg-clip-text text-transparent mb-2">
               Sosyal Kütüphane
            </h1>
            <p className="text-gray-600">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-shake">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition outline-none"
                placeholder="ornek@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Şifremi Unuttum */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition font-medium"
              >
                Şifremi Unuttum
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-700 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-slate-900 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Giriş Yapılıyor...</span>
                </div>
              ) : (
                ' Giriş Yap'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-blue-800 font-semibold hover:underline transition">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        
        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;