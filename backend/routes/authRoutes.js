const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register - Kayıt ol
router.post('/register', authController.register);

// POST /api/auth/login - Giriş yap
router.post('/login', authController.login);

// GET /api/auth/me - Kullanıcı bilgisi al (giriş gerekli)
router.get('/me', protect, authController.getMe);

module.exports = router;

//const express = require('express');
//const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);  // YENİ
router.post('/reset-password', authController.resetPassword);    // YENİ

module.exports = router;