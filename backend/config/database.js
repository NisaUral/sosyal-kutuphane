const { Sequelize } = require('sequelize');
require('dotenv').config();

// MySQL veritabanı bağlantısı
const sequelize = new Sequelize(
  process.env.DB_NAME,        // sosyal_kutuphane
  process.env.DB_USER,        // root
  process.env.DB_PASSWORD,    // senin şifren
  {
    host: process.env.DB_HOST,  // localhost
    dialect: 'mysql',
    logging: false,  // SQL sorgularını gösterme
    pool: {
      max: 5,        // Maksimum 5 bağlantı
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Bağlantıyı test et
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL bağlantısı başarılı!');
  })
  .catch(err => {
    console.error('❌ MySQL bağlantı hatası:', err);
  });

module.exports = sequelize;