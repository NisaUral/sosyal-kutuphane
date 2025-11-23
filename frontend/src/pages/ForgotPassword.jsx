import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('Email gerekli!');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setSuccess(true);
      
      // SADECE DEVELOPMENT! Production'da kaldır
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
      
      alert('Şifre sıfırlama kodu oluşturuldu!');
    } catch (error) {
      alert('Hata: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔐 Şifremi Unuttum
          </h1>
          <p className="text-gray-600">
            Email adresinizi girin, size şifre sıfırlama kodu gönderelim
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
            </button>

            <Link
              to="/login"
              className="block text-center text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Giriş Sayfasına Dön
            </Link>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Kod Oluşturuldu!
            </h3>
            
            {/* SADECE DEVELOPMENT */}
            {resetToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>⚠️ Development Mode</strong>
                </p>
                <p className="text-lg font-mono font-bold text-yellow-900">
                  {resetToken}
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Bu kodu bir sonraki sayfada kullanın
                </p>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Email: <strong>{email}</strong>
            </p>

            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Şifreyi Sıfırla →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;