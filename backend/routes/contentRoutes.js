const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');



router.get('/search', contentController.searchContent);
router.get('/popular/movies', contentController.getPopularMovies);
router.get('/movies/genre', contentController.getMoviesByGenre);
router.get('/books/category', contentController.getBooksByCategory);  // ← ÖNE AL
router.get('/top-rated', contentController.getTopRated);
router.get('/top-rated-books', contentController.getTopRatedBooks);

router.get('/:type/:externalId', contentController.getContentDetails);  // ← EN SONDA KALMALI
//router.get('/book/:bookId', contentController.getBookDetails);





module.exports = router;