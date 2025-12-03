const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); // ← YENİ
const path = require('path'); // ← YENİ
const fs = require('fs');


// Multer ayarları - Avatar yükleme
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Dosya adı: userId-timestamp.uzantı
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Dosya filtresi - Sadece resim
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Veritabanı bağlantısı yardımcı fonksiyonu
const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};




// Önerilen kullanıcılar - ÖNEMLİ: /:id route'undan ÖNCE OLMALI!
// Önerilen kullanıcılar - BASİTLEŞTİRİLMİŞ VERSİYON
router.get('/suggestions/list', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await getConnection();

    // Kullanıcının takip ETMEDİĞİ kişileri getir (library olmadan)
    const [users] = await connection.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.avatar_url,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
      FROM users u
      WHERE u.id != ? 
      AND u.id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      ORDER BY followers_count DESC
      LIMIT 5`,
      [userId, userId]
    );

    await connection.end();

    res.json({ 
      success: true,
      suggestions: users 
    });

  } catch (error) {
    console.error('Öneri kullanıcıları hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı Arama
router.get('/search', protect, async (req, res) => {
   console.log('🔍 /search route çağrıldı!');  // ← EKLE
  console.log('Query:', req.query);
  try {
    const { query } = req.query;
    const userId = req.user.id;
    console.log('User ID:', userId);           // ← EKLE
    console.log('Arama:', query);

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, users: [] });
    }

    const connection = await getConnection();

    // Username'e göre ara (kendisi hariç)
    const [users] = await connection.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.avatar_url,
        u.bio,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) > 0 as is_following
      FROM users u
      WHERE u.id != ? 
      AND u.username LIKE ?
      ORDER BY followers_count DESC
      LIMIT 20`,
      [userId, userId, `%${query}%`]
    );

    await connection.end();

    res.json({ 
      success: true,
      users 
    });

  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id/stats', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    const connection = await getConnection();

    // Takipçi ve takip sayıları
    const [followStats] = await connection.query(
      `SELECT 
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count`,
      [userId, userId]
    );

    // Library tablosu kontrolü
    let libraryStats = { watched: 0, to_watch: 0, read: 0, to_read: 0, total: 0 };

    try {
      const [library] = await connection.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'watched' THEN 1 ELSE 0 END) as watched,
          SUM(CASE WHEN status = 'to_watch' THEN 1 ELSE 0 END) as to_watch,
          SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
          SUM(CASE WHEN status = 'to_read' THEN 1 ELSE 0 END) as to_read
        FROM user_library
        WHERE user_id = ?`,
        [userId]
      );

      if (library && library[0]) {
        libraryStats = {
          watched: parseInt(library[0].watched) || 0,
          to_watch: parseInt(library[0].to_watch) || 0,
          read: parseInt(library[0].read) || 0,
          to_read: parseInt(library[0].to_read) || 0,
          total: parseInt(library[0].total) || 0
        };
      }
    } catch (libError) {
      console.log('Library tablosu yok, 0 döndürülüyor');
    }

    await connection.end();

    res.json({
      success: true,
      stats: {
        followers: parseInt(followStats[0].followers_count) || 0,
        following: parseInt(followStats[0].following_count) || 0,
        watched: libraryStats.watched,
        to_watch: libraryStats.to_watch,
        read: libraryStats.read,
        to_read: libraryStats.to_read,
        total: libraryStats.total
      }
    });

  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı Profilini Getir
router.get('/:id', protect, async (req, res) => {
  try {
    const connection = await getConnection();

    const [users] = await connection.query(
  `SELECT 
    id, username, email, avatar_url, bio, created_at,
    (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following_count
  FROM users 
  WHERE id = ?`,
  [req.params.id]
);

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});





// Kullanıcı İstatistikleri


// Profil Güncelle
// Profil Güncelle
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, avatar_url, bio } = req.body;  // ← bio eklendi

    const connection = await getConnection();

    // Username benzersizliği kontrol et
    if (username) {
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );

      if (existingUsers.length > 0) {
        await connection.end();
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor!' });
      }
    }

    // Email benzersizliği kontrol et
    if (email) {
      const [existingEmails] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmails.length > 0) {
        await connection.end();
        return res.status(400).json({ message: 'Bu email zaten kullanılıyor!' });
      }
    }

    // Profili güncelle
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url || null);
    }

    if (bio !== undefined) {  // ← YENİ
      updates.push('bio = ?');
      values.push(bio || null);
    }

    if (updates.length === 0) {
      await connection.end();
      return res.status(400).json({ message: 'Güncellenecek alan yok!' });
    }

    values.push(userId);

    await connection.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Güncellenmiş kullanıcı bilgilerini al
    const [users] = await connection.query(
      'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Profil güncellendi!',
      user: users[0]
    });

  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Avatar Yükle
// Avatar Yükle - DOSYA İLE
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi!' });
    }

    const userId = req.user.id;
    const connection = await getConnection();

    // Eski avatar'ı sil (varsa ve sunucudaysa)
    const [oldUser] = await connection.query(
      'SELECT avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (oldUser[0]?.avatar_url && oldUser[0].avatar_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', oldUser[0].avatar_url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Yeni avatar URL'i
    const avatar_url = `/uploads/avatars/${req.file.filename}`;

    // Veritabanını güncelle
    await connection.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatar_url, userId]
    );

    // Güncellenmiş kullanıcıyı al
    const [users] = await connection.query(
      'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Avatar yüklendi!',
      user: users[0]
    });

  } catch (error) {
    console.error('Avatar yükleme hatası:', error);
    
    // Hata varsa yüklenen dosyayı sil
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ 
      message: error.message || 'Avatar yüklenirken hata oluştu!' 
    });
  }
});

module.exports = router;