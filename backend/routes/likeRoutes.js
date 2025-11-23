const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const getConnection = async () => {
  const mysql = require('mysql2/promise');
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// Beğeni ekle/kaldır (toggle)
router.post('/toggle', protect, async (req, res) => {
  try {
    const { activity_id } = req.body;
    const user_id = req.user.id;

    console.log('💙 Beğeni toggle isteği:', { activity_id, user_id });

    if (!activity_id) {
      return res.status(400).json({ message: 'activity_id gerekli!' });
    }

    const connection = await getConnection();

    // Zaten beğenmiş mi kontrol et
    const [existing] = await connection.query(
      'SELECT * FROM activity_likes WHERE activity_id = ? AND user_id = ?',
      [activity_id, user_id]
    );

    if (existing.length > 0) {
      // Beğeniyi kaldır
      await connection.query(
        'DELETE FROM activity_likes WHERE activity_id = ? AND user_id = ?',
        [activity_id, user_id]
      );
      
      await connection.end();
      
      console.log('💔 Beğeni kaldırıldı');
      
      return res.json({
        success: true,
        liked: false,
        message: 'Beğeni kaldırıldı'
      });
    } else {
      // Beğeni ekle
      await connection.query(
        'INSERT INTO activity_likes (activity_id, user_id, created_at) VALUES (?, ?, NOW())',
        [activity_id, user_id]
      );
      
      await connection.end();
      
      console.log('💙 Beğeni eklendi');
      
      return res.json({
        success: true,
        liked: true,
        message: 'Beğeni eklendi'
      });
    }

  } catch (error) {
    console.error('❌ Beğeni hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;