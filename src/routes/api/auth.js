const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const passport = require('../../middleware/passport');

router.get('/me', authController.me);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/issue-key', authController.issueApiKey);
router.post('/reset-password', authController.resetPasswordRequest);
router.post('/reset-password/consume', authController.resetPasswordConsume);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/generate-password', authController.generatePassword);

// API key protected example route
router.get(
  '/me-apikey',
  passport.authenticate('headerapikey', { session: false }),
  authController.me
);

module.exports = router;
