const { Activity, User, Content, Rating, Review, Follow } = require('../models');
const { Op } = require('sequelize');

const mysql = require('mysql2/promise');

// MySQL bağlantısı yardımcı fonksiyon
const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// Sosyal Feed (Takip edilenlerin aktiviteleri)
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    console.log('Feed getiriliyor:', { userId, page, limit });

    const connection = await getConnection();

    // Kullanıcının takip ettiği kişileri al
    const [following] = await connection.query(
      'SELECT following_id FROM follows WHERE follower_id = ?',
      [userId]
    );

    const followingIds = following.map(f => f.following_id);

    // Eğer kimseyi takip etmiyorsa boş dön
    if (followingIds.length === 0) {
      await connection.end();
      return res.json({
        activities: [],
        page: 1,
        totalPages: 0,
        total: 0
      });
    }

    // Takip edilen kullanıcıların aktivitelerini getir
    const placeholders = followingIds.map(() => '?').join(',');
    
    const [activities] = await connection.query(
      `SELECT 
        activities.id,
    activities.activity_type,
    activities.created_at,
    users.id as user_id,
    users.username,
    users.avatar_url,
    contents.id as content_id,
    contents.external_id,
    contents.title,
    contents.type,
    contents.year,
    contents.poster_url,
    ratings.score,
    reviews.review_text,
    (SELECT COUNT(*) FROM likes WHERE likes.activity_id = activities.id) as like_count,
    (SELECT COUNT(*) FROM likes WHERE likes.activity_id = activities.id AND likes.user_id = ?) as user_liked
      FROM activities
      JOIN users ON activities.user_id = users.id
      JOIN contents ON activities.content_id = contents.id
      LEFT JOIN ratings ON activities.rating_id = ratings.id
      LEFT JOIN reviews ON activities.review_id = reviews.id
      WHERE activities.user_id IN (${placeholders})
      ORDER BY activities.created_at DESC
      LIMIT ? OFFSET ?`,
      [...followingIds,userId ,limit, offset]
    );

    // Toplam sayı
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total 
       FROM activities 
       WHERE user_id IN (${placeholders})`,
      followingIds
    );

    await connection.end();

    // Formatla
const formattedActivities = activities.map(activity => ({
  id: activity.id,
  activity_type: activity.activity_type,
  created_at: activity.created_at,
  user: {
    id: activity.user_id,
    username: activity.username,
    avatar_url: activity.avatar_url
  },
  content: {
    id: activity.content_id,
    external_id: activity.external_id,
    title: activity.title,
    type: activity.type,
    year: activity.year,
    poster_url: activity.poster_url
  },
  rating: activity.score ? { score: activity.score } : null,
  review: activity.review_text ? { review_text: activity.review_text } : null,
  like_count: activity.like_count || 0,  // YENİ
  user_liked: activity.user_liked > 0    // YENİ
}));

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      activities: formattedActivities,
      page,
      totalPages,
      total
    });

  } catch (error) {
    console.error('Feed getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcının Aktivitelerini Getir (Profil sayfası için)
exports.getUserActivities = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const activities = await Activity.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar_url']
        },
        {
          model: Content,
          as: 'content',
          attributes: ['id', 'title', 'type', 'poster_url', 'year']
        },
        {
          model: Rating,
          as: 'rating',
          required: false
        },
        {
          model: Review,
          as: 'review',
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });

  } catch (error) {
    console.error('Aktivite getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktiviteler alınamadı',
      error: error.message
    });
  }
};

// Aktivite Oluştur (Yardımcı fonksiyon - başka controllerlar kullanacak)
exports.createActivity = async (user_id, activity_type, content_id, rating_id = null, review_id = null) => {
  try {
    const activity = await Activity.create({
      user_id,
      activity_type,
      content_id,
      rating_id,
      review_id
    });

    return activity;
  } catch (error) {
    console.error('Aktivite oluşturma hatası:', error);
    throw error;
  }
};
module.exports = {
  getFeed: exports.getFeed,
  getUserActivities: exports.getUserActivities,
  createActivity: exports.createActivity
};