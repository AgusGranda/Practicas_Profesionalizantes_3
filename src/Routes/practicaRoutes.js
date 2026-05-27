const express = require('express');
const router = express.Router();

const practicaController = require('../Controllers/practicaController');

router.get('/', practicaController.index);

module.exports = router;
