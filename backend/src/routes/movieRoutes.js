const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', movieController.getAll);
router.get('/:id', movieController.getById);

// Admin routes
router.post('/', authMiddleware, movieController.create);
router.put('/:id', authMiddleware, movieController.update);
router.delete('/:id', authMiddleware, movieController.delete);

module.exports = router;
