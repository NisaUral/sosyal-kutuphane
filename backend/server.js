require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// TEST: .env okunuyor mu?
console.log('🔑 TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'VAR ✅' : 'YOK ❌');
console.log('🔑 GOOGLE_BOOKS_BASE_URL:', process.env.GOOGLE_BOOKS_BASE_URL);

const sequelize = require('./config/database');

// Routes - TEK SEFERLIK IMPORT
const authRoutes = require('./routes/authRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/users');
const followRoutes = require('./routes/followRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const likeRoutes = require('./routes/likeRoutes');
const listRoutes = require('./routes/listRoutes');
const contentsRoutes = require('./routes/contentRoutes');  // TEK BU YETER!

const app = express();

app.use(cors());
app.use(express.json());

// Routes kullanımı
app.use('/api/auth', authRoutes);
app.use('/api/contents', contentsRoutes);  // ← contentsRoutes kullan
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/lists', listRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend çalışıyor!',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me'
      ],
      contents: [
        'GET /api/contents/search?query=&type=',
        'GET /api/contents/popular/movies',
        'GET /api/contents/top-rated-books',
        'GET /api/contents/:type/:externalId'
      ],
      ratings: [
        'POST /api/ratings',
        'GET /api/ratings/content/:id'
      ],
      reviews: [
        'POST /api/reviews',
        'GET /api/reviews/content/:id'
      ],
      library: [
        'POST /api/library',
        'GET /api/library/:user_id'
      ],
      follow: [
        'POST /api/follows/:user_id',
        'GET /api/follows/followers/:user_id'
      ],
      activities: [
        'GET /api/activities/feed',
        'GET /api/activities/user/:user_id'
      ]
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Sunucu ${PORT} portunda çalışıyor`);
  console.log(`📚 Toplam 10 route grubu aktif`);
});