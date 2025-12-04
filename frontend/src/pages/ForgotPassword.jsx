import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { showError, showInfo, showWarning } from '../utils/toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showWarning('Email gerekli!');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      
      
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
      
      showInfo('Şifre sıfırlama kodu oluşturuldu!');
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
               Şifremi Unuttum
            </h1>
            <p className="text-gray-300">
              Email adresinizi girin, size şifre sıfırlama kodu gönderelim
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-700 to-slate-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-slate-900 transition font-semibold disabled:opacity-50 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gönderiliyor...</span>
                  </div>
                ) : (
                  ' Kod Gönder'
                )}
              </button>

              <Link
                to="/login"
                className="block text-center text-gray-300 hover:text-white transition text-sm"
              >
                ← Giriş Sayfasına Dön
              </Link>
            </form>
          ) : (
            <div className="text-center">
              
              <h3 className="text-xl font-bold text-white mb-4">
                Kod Oluşturuldu!
              </h3>
              
              {/* SADECE DEVELOPMENT */}
              {resetToken && (
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/40 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-200 mb-2">
                    <strong>⚠️ Development Mode</strong>
                  </p>
                  <p className="text-lg font-mono font-bold text-yellow-100">
                    {resetToken}
                  </p>
                  <p className="text-xs text-yellow-300 mt-2">
                    Bu kodu bir sonraki sayfada kullanın
                  </p>
                </div>
              )}

              <p className="text-gray-300 mb-6">
                Email: <strong className="text-white">{email}</strong>
              </p>

              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-block bg-gradient-to-r from-gray-700 to-slate-800 text-white px-6 py-3 rounded-xl hover:from-gray-800 hover:to-slate-900 transition font-semibold transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Şifreyi Sıfırla →
              </Link>
            </div>
          )}
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
          animation: shimmer 8s linear ;
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;