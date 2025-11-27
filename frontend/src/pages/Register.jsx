import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı!');
      return;
    }

    setLoading(true);

    try {
      const response = await register({ username, email, password });
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Kayıt başarısız!');
      }

      login(response.user, response.token);
      navigate('/feed');
      
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.'));
    }
    
    setLoading(false);
  };

  const title = " Sosyal Kütüphane";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center px-4">
      
      {/* Card Container */}
      <div className="relative w-full max-w-md">
        {/* Glow Effect Behind Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-3xl blur-2xl opacity-20"></div>
        
        {/* White Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8">
          
          {/* Animated Title - Her harf sırayla zıplıyor */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">
              {title.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block animate-bounce-letter"
                  style={{
                    animationDelay: `${index * 0.15}s`
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            <p className="text-gray-600">
              Yeni hesap oluştur
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
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition outline-none"
                placeholder="kullaniciadi"
                required
                minLength="3"
                maxLength="50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition outline-none"
                placeholder="••••••••"
                required
                minLength="6"
              />
              <p className="text-xs text-gray-500 mt-1">
                En az 6 karakter olmalı
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition outline-none"
                placeholder="••••••••"
                required
              />
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
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                ' Kayıt Ol'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-blue-800 font-semibold hover:underline transition">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
  @keyframes bounce-letter {
    0%, 10% { transform: translateY(0); }
    5% { transform: translateY(-15px); }
    100% { transform: translateY(0); }
  }
  .animate-bounce-letter {
    animation: bounce-letter 5s ease-in-out infinite;
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

export default Register;