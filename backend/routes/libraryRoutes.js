const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/library
router.post('/', libraryController.addToLibrary);

// GET /api/library/user/:user_id  ← ÖNEMLİ: /user/ ekledik
router.get('/user/:user_id', libraryController.getUserLibrary);

// GET /api/library/check/:content_id
router.get('/check/:content_id', libraryController.checkInLibrary);

// PUT /api/library/:library_id
router.put('/:library_id', libraryController.updateLibraryStatus);

// DELETE /api/library/:library_id
router.delete('/:library_id', libraryController.removeFromLibrary);

module.exports = router;