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

// Feed - SADECE takip edilen kişilerin aktiviteleri
router.get('/feed', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    console.log('📰 Feed getiriliyor:', { userId, page, limit });

    const connection = await getConnection();

    const [activities] = await connection.query(
      `SELECT 
        a.id, 
        a.activity_type, 
        a.created_at,
        u.id as user_id, 
        u.username, 
        u.email, 
        u.avatar_url,
        c.id as content_id, 
        c.title, 
        c.year, 
        c.type, 
        c.poster_url, 
        c.external_id,
        rat.score as rating_score,
        rev.review_text,
        (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as like_count,
        (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id AND user_id = ?) as liked_by_user
      FROM activities a
      INNER JOIN follows f ON a.user_id = f.following_id
      INNER JOIN users u ON a.user_id = u.id
      INNER JOIN contents c ON a.content_id = c.id
      LEFT JOIN ratings rat ON a.rating_id = rat.id
      LEFT JOIN reviews rev ON a.review_id = rev.id
      WHERE f.follower_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset]
    );

    const [countResult] = await connection.query(
  `SELECT COUNT(*) as total
   FROM activities a
   INNER JOIN follows f ON a.user_id = f.following_id
   WHERE f.follower_id = ?`,
  [userId]
);

    await connection.end();

    const formattedActivities = activities.map(a => ({
      id: a.id,
      activity_type: a.activity_type,
      created_at: a.created_at,
      like_count: parseInt(a.like_count) || 0,
      liked_by_user: parseInt(a.liked_by_user) > 0,
      user: {
        id: a.user_id,
        username: a.username,
        email: a.email,
        avatar_url: a.avatar_url
      },
      content: {
        id: a.content_id,
        title: a.title,
        year: a.year,
        type: a.type,
        poster_url: a.poster_url,
        external_id: a.external_id
      },
      rating: a.rating_score ? { score: a.rating_score } : null,
      review: a.review_text ? { review_text: a.review_text } : null
    }));

    console.log(`✅ ${formattedActivities.length} aktivite bulundu`);
const total = countResult[0].total;
const totalPages = Math.ceil(total / limit);

res.json({
  success: true,
  activities: formattedActivities,
  page: page,
  totalPages: totalPages,
  total: total
});

  } catch (error) {
    console.error('❌ Feed hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcının aktiviteleri
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    console.log('📊 Kullanıcı aktiviteleri getiriliyor:', { userId, page, limit });

    const connection = await getConnection();

    // 1. Kullanıcının aktivitelerini getir (yorumlar, puanlar)
    const [activities] = await connection.query(
      `SELECT 
        a.id, 
        'activity' as source,
        a.activity_type, 
        a.created_at,
        u.id as user_id, 
        u.username, 
        u.email, 
        u.avatar_url,
        c.id as content_id, 
        c.title, 
        c.year, 
        c.type, 
        c.poster_url, 
        c.external_id,
        rat.score as rating_score,
        rev.review_text,
        (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as like_count,
        (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id AND user_id = ?) as liked_by_user
      FROM activities a
      INNER JOIN users u ON a.user_id = u.id
      INNER JOIN contents c ON a.content_id = c.id
      LEFT JOIN ratings rat ON a.rating_id = rat.id
      LEFT JOIN reviews rev ON a.review_id = rev.id
      WHERE a.user_id = ?`,
      [userId, userId]
    );

    // 2. Kullanıcının beğenilerini getir
    const [likes] = await connection.query(
      `SELECT 
        al.id,
        'like' as source,
        'like' as activity_type,
        al.created_at,
        u.id as user_id,
        u.username,
        u.email,
        u.avatar_url,
        c.id as content_id,
        c.title,
        c.year,
        c.type,
        c.poster_url,
        c.external_id,
        a.activity_type as liked_activity_type,
        liked_user.username as liked_username
      FROM activity_likes al
      INNER JOIN activities a ON al.activity_id = a.id
      INNER JOIN users u ON al.user_id = u.id
      INNER JOIN contents c ON a.content_id = c.id
      INNER JOIN users liked_user ON a.user_id = liked_user.id
      WHERE al.user_id = ?`,
      [userId]
    );

    await connection.end();

    // 3. Aktiviteleri ve beğenileri birleştir
    const allActivities = [
      ...activities.map(a => ({
        id: `activity-${a.id}`,
        source: 'activity',
        activity_type: a.activity_type,
        created_at: a.created_at,
        like_count: parseInt(a.like_count) || 0,
        liked_by_user: parseInt(a.liked_by_user) > 0,
        user: {
          id: a.user_id,
          username: a.username,
          email: a.email,
          avatar_url: a.avatar_url
        },
        content: {
          id: a.content_id,
          title: a.title,
          year: a.year,
          type: a.type,
          poster_url: a.poster_url,
          external_id: a.external_id
        },
        rating: a.rating_score ? { score: a.rating_score } : null,
        review: a.review_text ? { review_text: a.review_text } : null
      })),
      ...likes.map(l => ({
        id: `like-${l.id}`,
        source: 'like',
        activity_type: 'like',
        created_at: l.created_at,
        like_count: 0,
        liked_by_user: false,
        user: {
          id: l.user_id,
          username: l.username,
          email: l.email,
          avatar_url: l.avatar_url
        },
        content: {
          id: l.content_id,
          title: l.title,
          year: l.year,
          type: l.type,
          poster_url: l.poster_url,
          external_id: l.external_id
        },
        liked_activity_type: l.liked_activity_type,
        liked_username: l.liked_username
      }))
    ];

    // 4. Tarihe göre sırala ve sayfalama
    allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginatedActivities = allActivities.slice(offset, offset + limit);

    console.log(`✅ ${allActivities.length} aktivite bulundu (${activities.length} aktivite + ${likes.length} beğeni)`);

    res.json({
      success: true,
      activities: paginatedActivities,
      totalPages: Math.ceil(allActivities.length / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('❌ Kullanıcı aktiviteleri hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;