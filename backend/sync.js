require('dotenv').config();
const sequelize = require('./config/database');
const models = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Veritabanı senkronizasyonu başlıyor...');
    
    await sequelize.sync({ force: true });
    
    console.log('✅ Tüm tablolar başarıyla oluşturuldu!');
    console.log('📊 Oluşturulan tablolar:');
    console.log('   - users');
    console.log('   - contents');
    console.log('   - ratings');
    console.log('   - reviews');
    console.log('   - libraries');
    console.log('   - follows');
    console.log('   - activities');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

syncDatabase();