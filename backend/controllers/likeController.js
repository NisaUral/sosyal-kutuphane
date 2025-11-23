const mysql = require('mysql2/promise');

const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// Beğen/Beğeniyi Kaldır (Toggle)
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;

    const connection = await getConnection();

    // Daha önce beğenmiş mi?
    const [existing] = await connection.query(
      'SELECT * FROM likes WHERE user_id = ? AND activity_id = ?',
      [userId, activityId]
    );

    if (existing.length > 0) {
      // Beğeniyi kaldır
      await connection.query(
        'DELETE FROM likes WHERE user_id = ? AND activity_id = ?',
        [userId, activityId]
      );
      
      await connection.end();
      
      return res.json({
        success: true,
        liked: false,
        message: 'Beğeni kaldırıldı'
      });
    } else {
      // Beğen
      await connection.query(
        'INSERT INTO likes (user_id, activity_id) VALUES (?, ?)',
        [userId, activityId]
      );
      
      await connection.end();
      
      return res.json({
        success: true,
        liked: true,
        message: 'Beğenildi!'
      });
    }
  } catch (error) {
    console.error('Beğeni hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Aktivitenin beğeni sayısını getir
exports.getLikesCount = async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const connection = await getConnection();
    
    const [result] = await connection.query(
      'SELECT COUNT(*) as count FROM likes WHERE activity_id = ?',
      [activityId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      count: result[0].count
    });
  } catch (error) {
    console.error('Beğeni sayısı hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};