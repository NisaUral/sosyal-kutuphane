const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/reviews - Yorum yap (giriş gerekli)
router.post('/', protect, reviewController.addReview);

// GET /api/reviews/content/:content_id - İçeriğin tüm yorumları (herkes görebilir)
router.get('/content/:content_id', reviewController.getContentReviews);

// GET /api/reviews/user/:user_id - Kullanıcının tüm yorumları
router.get('/user/:user_id', reviewController.getUserReviews);

// PUT /api/reviews/:review_id - Yorumu güncelle (giriş gerekli)
router.put('/:review_id', protect, reviewController.updateReview);

// DELETE /api/reviews/:review_id - Yorumu sil (giriş gerekli)
router.delete('/:review_id', protect, reviewController.deleteReview);

module.exports = router;