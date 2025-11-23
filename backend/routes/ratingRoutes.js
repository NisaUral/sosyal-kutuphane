const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Tüm route'lar giriş gerektirir
router.use(protect);

// POST /api/ratings - Puan ver veya güncelle
router.post('/', ratingController.addOrUpdateRating);

// GET /api/ratings/content/:content_id - İçeriğin tüm puanları
router.get('/content/:content_id', ratingController.getContentRatings);

// GET /api/ratings/my/:content_id - Kullanıcının bir içeriğe verdiği puan
router.get('/my/:content_id', ratingController.getUserRating);

// DELETE /api/ratings/:content_id - Puanı sil
router.delete('/:content_id', ratingController.deleteRating);

module.exports = router;