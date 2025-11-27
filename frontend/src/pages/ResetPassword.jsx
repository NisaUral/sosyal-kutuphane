import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { showError, showSuccess } from '../utils/toast';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3 dakika

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (timer <= 0) return;

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (timer <= 0) {
      showError('Sıfırlama kodunun süresi doldu. Lütfen yeni bir kod isteyin.');
      return;
    }

    if (!email || !resetToken || !newPassword) {
      showError('Tüm alanları doldurun!');
      return;
    }

    if (newPassword.length < 6) {
      showError('Şifre en az 6 karakter olmalı!');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, resetToken, newPassword);
      showSuccess('Şifre başarıyla değiştirildi! 🎉');
      navigate('/login');
    } catch (error) {
      showError('Hata: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Çapraz Işık Çizgisi */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent transform -rotate-45 origin-top-left animate-shimmer"></div>
      </div>

      {/* Glassmorphism Card */}
      <div className="relative max-w-md w-full">
        {/* Glow Behind Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-3xl blur-2xl opacity-20"></div>
        
        {/* Şeffaf Card */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
               Yeni Şifre Belirle
            </h1>
            <p className="text-gray-300">
              Size gönderilen kodu girin ve yeni şifrenizi belirleyin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition outline-none"
                required
              />
            </div>

            {/* Sıfırlama Kodu + Sayaç */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  Sıfırlama Kodu
                </label>
                
                {timer > 0 ? (
                  <span className="text-sm font-medium text-green-400">
                     {formatTime(timer)}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-red-400">
                     Süre Doldu!
                  </span>
                )}
              </div>
              
              <input
  type="text"
  value={resetToken}
  onChange={(e) => setResetToken(e.target.value)}
  placeholder="6 haneli kod"
  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition outline-none text-center font-mono tracking-wider"
  maxLength="6"
  required
/>
            </div>

            {/* Yeni Şifre */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition outline-none"
                minLength="6"
                required
              />
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition outline-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || timer <= 0}
              className="w-full bg-gradient-to-r from-gray-700 to-slate-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-slate-900 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Değiştiriliyor...</span>
                </div>
              ) : (
                ' Şifreyi Değiştir'
              )}
            </button>

            <Link
              to="/login"
              className="block text-center text-gray-300 hover:text-white transition text-sm"
            >
              ← Giriş Sayfasına Dön
            </Link>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { 
            transform: translateX(-100vw) translateY(-100vh) rotate(-45deg);
          }
          100% { 
            transform: translateX(100vw) translateY(100vh) rotate(-45deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ResetPassword;