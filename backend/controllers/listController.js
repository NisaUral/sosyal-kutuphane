const mysql = require('mysql2/promise');

const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sosyal_kutuphane'
  });
};

// Kullanıcının listelerini getir
exports.getUserLists = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const connection = await getConnection();
    
    const [lists] = await connection.query(
      `SELECT 
        lists.*,
        COUNT(list_items.id) as item_count
      FROM lists
      LEFT JOIN list_items ON lists.id = list_items.list_id
      WHERE lists.user_id = ?
      GROUP BY lists.id
      ORDER BY lists.created_at DESC`,
      [userId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      lists
    });
  } catch (error) {
    console.error('Liste getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni liste oluştur
exports.createList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, is_public } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Liste adı gerekli!' });
    }
    
    const connection = await getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO lists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
      [userId, name.trim(), description || '', is_public !== false]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Liste oluşturuldu!',
      listId: result.insertId
    });
  } catch (error) {
    console.error('Liste oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Listeye içerik ekle
exports.addToList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { contentId } = req.body;
    
    const connection = await getConnection();
    
    // Liste kullanıcıya ait mi?
    const [list] = await connection.query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    
    if (list.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Liste bulunamadı!' });
    }
    
    // İçerik zaten listede mi?
    const [existing] = await connection.query(
      'SELECT * FROM list_items WHERE list_id = ? AND content_id = ?',
      [listId, contentId]
    );
    
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ message: 'İçerik zaten listede!' });
    }
    
    // Ekle
    await connection.query(
      'INSERT INTO list_items (list_id, content_id) VALUES (?, ?)',
      [listId, contentId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Listeye eklendi!'
    });
  } catch (error) {
    console.error('Listeye ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Liste detayı (içerikleriyle)
exports.getListDetails = async (req, res) => {
  try {
    const { listId } = req.params;
    
    const connection = await getConnection();
    
    // Liste bilgisi
    const [lists] = await connection.query(
      `SELECT 
        lists.*,
        users.username,
        users.avatar_url
      FROM lists
      JOIN users ON lists.user_id = users.id
      WHERE lists.id = ?`,
      [listId]
    );
    
    if (lists.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Liste bulunamadı!' });
    }
    
    const list = lists[0];
    
    // Liste içerikleri
    const [items] = await connection.query(
      `SELECT 
        contents.*,
        list_items.added_at
      FROM list_items
      JOIN contents ON list_items.content_id = contents.id
      WHERE list_items.list_id = ?
      ORDER BY list_items.added_at DESC`,
      [listId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      list: {
        ...list,
        items
      }
    });
  } catch (error) {
    console.error('Liste detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Listeden çıkar
exports.removeFromList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, contentId } = req.params;
    
    const connection = await getConnection();
    
    // Liste kullanıcıya ait mi?
    const [list] = await connection.query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    
    if (list.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Liste bulunamadı!' });
    }
    
    await connection.query(
      'DELETE FROM list_items WHERE list_id = ? AND content_id = ?',
      [listId, contentId]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Listeden çıkarıldı!'
    });
  } catch (error) {
    console.error('Listeden çıkarma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Liste sil
exports.deleteList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    
    const connection = await getConnection();
    
    // Liste kullanıcıya ait mi?
    const [list] = await connection.query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, userId]
    );
    
    if (list.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Liste bulunamadı!' });
    }
    
    await connection.query('DELETE FROM lists WHERE id = ?', [listId]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Liste silindi!'
    });
  } catch (error) {
    console.error('Liste silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};