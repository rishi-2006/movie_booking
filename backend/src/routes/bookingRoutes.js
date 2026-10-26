const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/', bookingController.create);
router.get('/:id', bookingController.getById);

// Admin routes
router.get('/', authMiddleware, bookingController.getAll);
router.patch('/:id/cancel', authMiddleware, bookingController.cancel);

module.exports = router;
