const express = require('express');
const router = express.Router();

const authController = require('../Controllers/authController');

router.get('/login', authController.loginView);
router.post('/login', authController.login);

router.get('/register', authController.registerView);
router.post('/register', authController.register);

router.post('/logout', authController.logout);

module.exports = router;