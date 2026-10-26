const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');

router.get('/', cinemaController.getAll);
router.get('/:id', cinemaController.getById);

module.exports = router;
