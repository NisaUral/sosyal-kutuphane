import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // YENİ: Geri sayım sayacı için state (3 dakika = 180 saniye)
  const [timer, setTimer] = useState(180);

  useEffect(() => {
    // URL'den email al
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // YENİ: Geri sayım sayacını başlatan ve yöneten useEffect
  useEffect(() => {
    // Süre 0'a ulaştıysa interval'ı durdur
    if (timer <= 0) return;

    // Her saniyede timer'ı 1 azalt
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Component unmount olduğunda (sayfadan ayrıldığında) interval'ı temizle
    return () => clearInterval(intervalId);
  }, [timer]); // 'timer' state'i her değiştiğinde bu effect yeniden çalışır

  // YENİ: Saniyeyi "03:00" formatına çeviren yardımcı fonksiyon
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // YENİ: Süre dolduysa göndermeyi engelle
    if (timer <= 0) {
      alert('Sıfırlama kodunun süresi doldu. Lütfen yeni bir kod isteyin.');
      return;
    }

    if (!email || !resetToken || !newPassword) {
      alert('Tüm alanları doldurun!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalı!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, resetToken, newPassword);
      alert('Şifre başarıyla değiştirildi! 🎉');
      navigate('/login');
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
            🔑 Yeni Şifre Belirle
          </h1>
          <p className="text-gray-600">
            Size gönderilen kodu girin ve yeni şifrenizi belirleyin
          </p>
        </div>
        

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            {/* YENİ: Etiket ve sayacı yan yana koymak için div */}
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sıfırlama Kodu
              </label>
              
              {/* YENİ: Sayaç */}
              {timer > 0 ? (
                <span className="text-sm font-medium text-blue-600">
                  Kalan Süre: {formatTime(timer)}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">
                  Süre Doldu!
                </span>
              )}
            </div>
            
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="6 haneli kod"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
              maxLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              minLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            // YENİ: Süre dolduysa veya yükleniyorsa butonu pasif yap
            disabled={loading || timer <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>

          <Link
            to="/login"
            className="block text-center text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Giriş Sayfasına Dön
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;