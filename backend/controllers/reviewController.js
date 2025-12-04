const { Review, Content, User } = require('../models');
const activityController = require('./activityController');
// Yorum Yap
exports.addReview = async (req, res) => {
  try {
    const { content_id, review_text } = req.body;
    const user_id = req.user.id;

    // Validasyon
    if (!content_id || !review_text) {
      return res.status(400).json({
        success: false,
        message: 'İçerik ID ve yorum metni gerekli!'
      });
    }

    if (review_text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Yorum en az 10 karakter olmalı!'
      });
    }

    // İçerik var mı?
    const content = await Content.findByPk(content_id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı!'
      });
    }

    // Yorum oluştur
    const review = await Review.create({
      user_id,
      content_id,
      review_text: review_text.trim()
    });

    // ✨ AKTİVİTE OLUŞTUR (YENİ EKLENEN SATIRLAR)
    await activityController.createActivity(
      user_id,
      'review',
      content_id,
      null,
      review.id
    );

    // Yorumu kullanıcı bilgileriyle birlikte getir
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Yorum eklendi!',
      review: reviewWithUser
    });

  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum eklenirken hata oluştu',
      error: error.message
    });
  }
};

// Bir İçeriğin Tüm Yorumlarını Getir
exports.getContentReviews = async (req, res) => {
  try {
    const { content_id } = req.params;

    console.log('🔍 getContentReviews çağrıldı, content_id:', content_id);

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sosyal_kutuphane',
      timezone: '+03:00'
    });

    const [reviews] = await connection.query(
      `SELECT 
        r.id,
        r.user_id,
        r.content_id,
        r.review_text,
        r.created_at,
        r.updated_at,
        u.username,
        u.avatar_url
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.content_id = ?
      ORDER BY r.created_at DESC`,
      [content_id]
    );

    await connection.end();


    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('❌ Yorumları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar alınamadı',
      error: error.message
    });
  }
};

// Yorumu Güncelle
exports.updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { review_text } = req.body;
    const user_id = req.user.id;

    // Validasyon
    if (!review_text || review_text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Yorum en az 10 karakter olmalı!'
      });
    }

    // Yorum var mı ve kullanıcıya ait mi?
    const review = await Review.findByPk(review_id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı!'
      });
    }

    if (review.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Bu yorumu düzenleme yetkiniz yok!'
      });
    }

    // Güncelle
    review.review_text = review_text.trim();
    await review.save();

    // Kullanıcı bilgisiyle birlikte getir
    const updatedReview = await Review.findByPk(review_id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Yorum güncellendi!',
      review: updatedReview
    });

  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Yorumu Sil
exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;

    const review = await Review.findByPk(review_id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı!'
      });
    }

    if (review.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Bu yorumu silme yetkiniz yok!'
      });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Yorum silindi'
    });

  } catch (error) {
    console.error('Yorum silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum silinirken hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının Tüm Yorumlarını Getir
exports.getUserReviews = async (req, res) => {
  try {
    const { user_id } = req.params;

    const reviews = await Review.findAll({
      where: { user_id },
      include: [{
        model: Content,
        as: 'content',
        attributes: ['id', 'title', 'type', 'poster_url', 'year']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Kullanıcı yorumları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar alınamadı',
      error: error.message
    });
  }
};

exports.getContentReviews = async (req, res) => {
  try {
    const { content_id } = req.params;

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sosyal_kutuphane'
    });

    const [reviews] = await connection.query(
      `SELECT 
        r.id,
        r.user_id,
        r.content_id,
        r.review_text,
        r.created_at,
        r.updated_at,
        u.username,
        u.avatar_url
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.content_id = ?
      ORDER BY r.created_at DESC`,
      [content_id]
    );

    await connection.end();

    console.log('📋 Yorumlar:', reviews.length);
    console.log('🕐 İlk yorumun tarihi:', reviews[0]?.created_at);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar alınamadı',
      error: error.message
    });
  }
};
module.exports = {
  addReview: exports.addReview,
  getContentReviews: exports.getContentReviews,
  updateReview: exports.updateReview,
  deleteReview: exports.deleteReview,
  getUserReviews: exports.getUserReviews
};