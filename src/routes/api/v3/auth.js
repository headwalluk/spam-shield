const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const passport = require('../../../middleware/passport');

/**
 * @openapi
 * /api/v3/auth/register:
 *   post:
 *     summary: Register a new user (pending until email verified)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Email exists
 * /api/v3/auth/login:
 *   post:
 *     summary: Login (requires verified email)
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Invalid credentials or email not verified
 * /api/v3/auth/me:
 *   get:
 *     summary: Get current user (session cookie auth)
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthenticated
 * /api/v3/auth/issue-key:
 *   post:
 *     summary: Issue an API key for the current user
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthenticated
 * /api/v3/auth/me-apikey:
 *   get:
 *     summary: Current user using API key header
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthenticated
 * /api/v3/auth/reset-password:
 *   post:
 *     summary: Request password reset
 *     responses:
 *       200:
 *         description: OK
 *       201:
 *         description: Created
 * /api/v3/auth/reset-password/consume:
 *   post:
 *     summary: Consume password reset token
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         description: Invalid token
 * /api/v3/auth/verify-email:
 *   get:
 *     summary: Verify email using token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid or expired
 * /api/v3/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     responses:
 *       201:
 *         description: Created
 *       429:
 *         description: Cooldown in effect
 * /api/v3/auth/generate-password:
 *   get:
 *     summary: Generate a strong password sample
 *     responses:
 *       200:
 *         description: OK
 */

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

router.get(
  '/me-apikey',
  passport.authenticate('headerapikey', { session: false }),
  authController.me
);

module.exports = router;
