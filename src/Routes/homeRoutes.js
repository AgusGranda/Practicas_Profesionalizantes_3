const express = require('express');
const router = express.Router();

const homeController = require('../Controllers/homeController');

router.get('/', homeController.index);

module.exports = router;