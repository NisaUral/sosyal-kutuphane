const { Rating, Content, User } = require('../models');
const activityController = require('./activityController'); 

// Puan Ver veya Güncelle
exports.addOrUpdateRating = async (req, res) => {
  try {
    const { content_id, score } = req.body;
    const user_id = req.user.id;

    // 1. Validasyon
    if (!content_id || !score) {
      return res.status(400).json({
        success: false,
        message: 'İçerik ID ve puan gerekli!'
      });
    }

    if (score < 1 || score > 10) {
      return res.status(400).json({
        success: false,
        message: 'Puan 1-10 arası olmalı!'
      });
    }

    // 2. İçerik var mı kontrol et
    const content = await Content.findByPk(content_id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı!'
      });
    }

    // 3. Kullanıcı daha önce puan vermiş mi?
    let rating = await Rating.findOne({
      where: { user_id, content_id }
    });

    if (rating) {
      // Varsa güncelle
      rating.score = score;
      await rating.save();

      return res.status(200).json({
        success: true,
        message: 'Puanınız güncellendi!',
        rating
      });
    } else {
      // Yoksa yeni oluştur
      rating = await Rating.create({
        user_id,
        content_id,
        score
      });

      // ✨ AKTİVİTE OLUŞTUR
      await activityController.createActivity(
        user_id,
        'rating',
        content_id,
        rating.id,
        null
      );

      return res.status(201).json({
        success: true,
        message: 'Puan verildi!',
        rating
      });
    }

  } catch (error) {
    console.error('Puanlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Puanlama sırasında hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının Bir İçeriğe Verdiği Puanı Getir
exports.getUserRating = async (req, res) => {
  try {
    const { content_id } = req.params;
    const user_id = req.user.id;

    const rating = await Rating.findOne({
      where: { user_id, content_id }
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Bu içeriğe puan vermemişsiniz'
      });
    }

    res.status(200).json({
      success: true,
      rating
    });

  } catch (error) {
    console.error('Rating getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hata oluştu',
      error: error.message
    });
  }
};

// Bir İçeriğin Tüm Puanlarını ve Ortalamasını Getir
exports.getContentRatings = async (req, res) => {
  try {
    const { content_id } = req.params;

    // İçerik var mı?
    const content = await Content.findByPk(content_id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı!'
      });
    }

    // Tüm puanları getir
    const ratings = await Rating.findAll({
      where: { content_id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    // Ortalama hesapla
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const averageScore = ratings.length > 0 ? (totalScore / ratings.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      content_id,
      rating_count: ratings.length,
      average_score: parseFloat(averageScore),
      ratings
    });

  } catch (error) {
    console.error('Puanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hata oluştu',
      error: error.message
    });
  }
};

// Puanı Sil
exports.deleteRating = async (req, res) => {
  try {
    const { content_id } = req.params;
    const user_id = req.user.id;

    const rating = await Rating.findOne({
      where: { user_id, content_id }
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Silinecek puan bulunamadı'
      });
    }

    await rating.destroy();

    res.status(200).json({
      success: true,
      message: 'Puan silindi'
    });

  } catch (error) {
    console.error('Puan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hata oluştu',
      error: error.message
    });
  }
};
module.exports = {
  addOrUpdateRating: exports.addOrUpdateRating,
  getUserRating: exports.getUserRating,
  getContentRatings: exports.getContentRatings,
  deleteRating: exports.deleteRating
};