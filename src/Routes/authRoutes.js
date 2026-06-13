const express = require('express');
const router = express.Router();

const authController = require('../Controllers/authController');

router.get('/login', authController.loginView);
router.post('/login', authController.login);

router.get('/register', authController.registerView);
router.post('/register', authController.register);

router.get('/forgot-password', authController.forgotPasswordView);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.resetPasswordView);
router.post('/reset-password/:token', authController.resetPassword);

router.post('/logout', authController.logout);

module.exports = router;
