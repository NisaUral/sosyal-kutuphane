const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Token kontrolü yapan middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Token'ı al (Header'dan)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Token var mı?
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Lütfen giriş yapın!'
      });
    }

    // 3. Token geçerli mi?
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Kullanıcı var mı?
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    // 5. Kullanıcıyı req'e ekle (sonraki fonksiyonlarda kullanılabilir)
    req.user = user;
    
    next();  // Devam et (bir sonraki fonksiyona geç)

  } catch (error) {
    console.error('Auth middleware hatası:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token!'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Sunucu hatası!'
    });
  }
};