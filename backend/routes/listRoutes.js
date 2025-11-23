const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

// Kullanıcının listeleri
router.get('/user/:userId', protect, listController.getUserLists);

// Yeni liste oluştur
router.post('/', protect, listController.createList);

// Liste detayı
router.get('/:listId', protect, listController.getListDetails);

// Listeye içerik ekle
router.post('/:listId/items', protect, listController.addToList);

// Listeden çıkar
router.delete('/:listId/items/:contentId', protect, listController.removeFromList);

// Liste sil
router.delete('/:listId', protect, listController.deleteList);

module.exports = router;