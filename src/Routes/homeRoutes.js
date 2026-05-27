const express = require('express');
const router = express.Router();

const homeController = require('../Controllers/homeController');

router.get('/', homeController.index);
router.get('/login', homeController.login);
router.post('/login', homeController.loginPost);
router.post('/logout', homeController.logout);

module.exports = router;
