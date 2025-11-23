const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { protect } = require('../middleware/authMiddleware');

const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// Takip et
router.post('/:userId', protect, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);

    if (followerId === followingId) {
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz!' });
    }

    const connection = await getConnection();

    // Zaten takip ediyor mu kontrol et
    const [existing] = await connection.query(
      'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ message: 'Zaten takip ediyorsunuz!' });
    }

    // Takip et
    await connection.query(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Takip başarılı!'
    });

  } catch (error) {
    console.error('Takip hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Takibi bırak
router.delete('/:userId', protect, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);

    const connection = await getConnection();

    await connection.query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Takip bırakıldı!'
    });

  } catch (error) {
    console.error('Takip bırakma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Takipçi listesi
router.get('/followers/:userId', protect, async (req, res) => {
  try {
    const connection = await getConnection();

    const [followers] = await connection.query(
      `SELECT u.id, u.username, u.email, u.avatar_url
       FROM users u
       INNER JOIN follows f ON u.id = f.follower_id
       WHERE f.following_id = ?`,
      [req.params.userId]
    );

    await connection.end();

    res.json({ followers });

  } catch (error) {
    console.error('Takipçi listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Takip edilen listesi
router.get('/following/:userId', protect, async (req, res) => {
  try {
    const connection = await getConnection();

    const [following] = await connection.query(
      `SELECT u.id, u.username, u.email, u.avatar_url
       FROM users u
       INNER JOIN follows f ON u.id = f.following_id
       WHERE f.follower_id = ?`,
      [req.params.userId]
    );

    await connection.end();

    res.json({ following });

  } catch (error) {
    console.error('Takip edilen listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Takip durumu kontrolü
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.userId);

    const connection = await getConnection();

    const [result] = await connection.query(
      'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    await connection.end();

    res.json({
      isFollowing: result.length > 0
    });

  } catch (error) {
    console.error('Takip durumu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;