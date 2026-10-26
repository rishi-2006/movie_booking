const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');

router.get('/', showController.getAll);
router.get('/:id', showController.getById);
router.get('/:id/seats', showController.getSeats);

module.exports = router;
