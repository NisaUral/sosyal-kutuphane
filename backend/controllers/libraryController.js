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

// Kütüphaneye Ekle
exports.addToLibrary = async (req, res) => {
  try {
    const { content_id, status } = req.body;
    const userId = req.user.id;

    console.log('Kütüphaneye ekleniyor:', { userId, content_id, status });

    const connection = await getConnection();

    // Önce var mı kontrol et
    const [existing] = await connection.query(
      'SELECT * FROM libraries WHERE user_id = ? AND content_id = ?',
      [userId, content_id]
    );

    if (existing.length > 0) {
      // Güncelle
      await connection.query(
        'UPDATE libraries SET status = ?, updated_at = NOW() WHERE user_id = ? AND content_id = ?',
        [status, userId, content_id]
      );
      console.log('Kütüphane güncellendi');
    } else {
      // Ekle
      await connection.query(
  'INSERT INTO libraries (user_id, content_id, status) VALUES (?, ?, ?)',
  [userId, content_id, status]
);
      console.log('Kütüphaneye eklendi');
    }

    await connection.end();

    res.json({ 
      success: true,
      message: 'Kütüphaneye eklendi!' 
    });
  } catch (error) {
    console.error('Kütüphane ekleme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası: ' + error.message 
    });
  }
};

// Kullanıcının Kütüphanesini Getir
exports.getUserLibrary = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const status = req.query.status;

    console.log('Kütüphane getiriliyor:', { userId, status });

    const connection = await getConnection();

    let query = `
      SELECT 
        libraries.id,
        libraries.status,
        contents.id as content_id,
        contents.title,
        contents.type,
        contents.year,
        contents.poster_url,
        contents.external_id
      FROM libraries
      JOIN contents ON libraries.content_id = contents.id
      WHERE libraries.user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ' AND libraries.status = ?';
      params.push(status);
    }

    query += 'ORDER BY libraries.id DESC';

    const [library] = await connection.query(query, params);

    await connection.end();

    // Formatla
    const formattedLibrary = library.map(item => ({
      id: item.id,
      status: item.status,
      created_at: item.created_at,
      content: {
        id: item.content_id,
        title: item.title,
        type: item.type,
        year: item.year,
        poster_url: item.poster_url,
        external_id: item.external_id
      }
    }));

    console.log(`${formattedLibrary.length} içerik bulundu`);

    res.json({ 
      success: true,
      library: formattedLibrary 
    });
  } catch (error) {
    console.error('Kütüphane getirme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası: ' + error.message 
    });
  }
};

// İçerik Kütüphanede mi Kontrol Et
exports.checkInLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.content_id;

    const connection = await getConnection();

    const [result] = await connection.query(
      'SELECT * FROM libraries WHERE user_id = ? AND content_id = ?',
      [userId, contentId]
    );

    await connection.end();

    res.json({ 
      success: true,
      inLibrary: result.length > 0,
      status: result.length > 0 ? result[0].status : null
    });
  } catch (error) {
    console.error('Kontrol hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası' 
    });
  }
};

// Kütüphane Durumunu Güncelle
exports.updateLibraryStatus = async (req, res) => {
  try {
    const libraryId = req.params.library_id;
    const { status } = req.body;
    const userId = req.user.id;

    const connection = await getConnection();

    await connection.query(
  'UPDATE libraries SET status = ? WHERE user_id = ? AND content_id = ?',
  [status, userId, content_id]
);

    await connection.end();

    res.json({ 
      success: true,
      message: 'Durum güncellendi!' 
    });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası' 
    });
  }
};

// Kütüphaneden Çıkar
exports.removeFromLibrary = async (req, res) => {
  try {
    const libraryId = req.params.library_id;
    const userId = req.user.id;

    const connection = await getConnection();

    await connection.query(
      'DELETE FROM libraries WHERE id = ? AND user_id = ?',
      [libraryId, userId]
    );

    await connection.end();

    res.json({ 
      success: true,
      message: 'Kütüphaneden çıkarıldı!' 
    });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası' 
    });
  }
};