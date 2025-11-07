const express = require('express');
const HomeController = require('../../controllers/homeController');
const passport = require('../../middleware/passport');
const config = require('../../config');
const authService = require('../../services/authService');

const router = express.Router();
const homeController = new HomeController();

// Define web routes
router.get('/', homeController.renderHomePage.bind(homeController));
router.get('/stats', homeController.renderStatsPage.bind(homeController));
router.get('/docs', (req, res) => {
  res.render('pages/docs', {
    title: 'Documentation',
    links: {
      apiUi: '/docs/api',
      apiSpec: '/api-docs.json'
    }
  });
});

// Auth pages
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/dash');
  }
  res.render('pages/login', { title: 'Login' });
});
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Surface friendlier message
      const msg =
        (info && info.code) === 'EMAIL_NOT_VERIFIED'
          ? 'Email not verified. You can request a new verification email.'
          : 'Invalid credentials';
      return res.status(401).render('pages/login', { title: 'Login', error: msg });
    }
    req.logIn(user, (err2) => {
      if (err2) {
        return next(err2);
      }
      return res.redirect('/dash');
    });
  })(req, res, next);
});

router.get('/register', (req, res) => {
  if (!config.auth.enableRegistration) {
    return res.redirect('/login');
  }
  res.render('pages/register', { title: 'Register', config });
});
router.post('/register', async (req, res) => {
  if (!config.auth.enableRegistration) {
    return res.redirect('/login');
  }
  const { email, password } = req.body;
  try {
    // Password strength validation (mirrors API behavior)
    const { validatePasswordStrength } = require('../../utils/validators');
    const strength = validatePasswordStrength(password, config.auth.passwordPolicy);
    if (!strength.valid) {
      return res.status(400).render('pages/register', {
        title: 'Register',
        error: 'Weak password: ' + strength.errors.join('; '),
        config
      });
    }
    // If development and first user, elevate to administrator after creating the user
    const db = require('../../db/knex');
    const [{ cnt }] = await db('users').count({ cnt: '*' });
    const shouldAdmin = config.env === 'development' && Number(cnt) === 0;

    const user = await authService.register({ email, password });

    if (shouldAdmin) {
      try {
        const userModel = require('../../models/userModel');
        const roleModel = require('../../models/roleModel');
        const adminRole = await roleModel.findByName('administrator');
        if (adminRole) {
          await userModel.assignRole(user.id, adminRole.id);
        }
      } catch (e) {
        console.warn('Failed to assign administrator role to first user:', e.message);
      }
    }
    // Do NOT log in yet; require email verification first
    const ttl = config.auth.verifyEmailTokenTTLMinutes;
    const success = `Thanks! We've sent a verification email to ${email}. The link expires in ${ttl} minute(s).`;
    return res.status(201).render('pages/verify-email', { title: 'Verify Email', success });
  } catch (e) {
    const error = e.message === 'EMAIL_EXISTS' ? 'Email already in use' : 'Registration failed';
    res.status(400).render('pages/register', { title: 'Register', error, config });
  }
});

router.get('/reset-password', (req, res) => {
  res.render('pages/reset-password', { title: 'Reset Password' });
});
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    // request reset; in dev we show token on the page
    const user = await require('../../models/userModel').findByEmail(email);
    let resetToken = null;
    if (user) {
      ({ resetToken } = await authService.createPasswordReset(user.id));
    }
    res.render('pages/reset-password', {
      title: 'Reset Password',
      info: resetToken
        ? `Dev token: ${resetToken}`
        : 'If the email exists, a reset email has been sent.'
    });
  } catch {
    res
      .status(500)
      .render('pages/reset-password', { title: 'Reset Password', error: 'Request failed' });
  }
});

// Auth guard
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  return next();
}

router.get('/dash', requireAuth, async (req, res) => {
  const roles = await authService.getUserRoles(req.user.id);
  res.render('pages/dash', { title: 'Dashboard', user: req.user, roles });
});

// Email verification landing page
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res
      .status(400)
      .render('pages/verify-email', { title: 'Verify Email', error: 'Missing token' });
  }
  try {
    const user = await authService.consumeEmailVerification(token);
    res.render('pages/verify-email', {
      title: 'Verify Email',
      success: 'Email verified successfully. You can now log in.',
      user
    });
  } catch (e) {
    const msg =
      e.message === 'VERIFY_INVALID' ? 'Invalid or expired token.' : 'Verification failed.';
    res.status(400).render('pages/verify-email', { title: 'Verify Email', error: msg });
  }
});

router.get('/verify-email/resend', (req, res) => {
  res.render('pages/resend-verification', {
    title: 'Resend Verification',
    prefill: req.query.email || ''
  });
});
router.post('/verify-email/resend', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).render('pages/resend-verification', {
      title: 'Resend Verification',
      error: 'Email required'
    });
  }
  try {
    const user = await require('../../models/userModel').findByEmail(email);
    if (!user || user.status_slug === 'active') {
      return res.render('pages/resend-verification', {
        title: 'Resend Verification',
        success: 'If your account needs verification, we have sent an email.'
      });
    }
    try {
      await require('../../services/authService').resendEmailVerification(user);
      return res.render('pages/resend-verification', {
        title: 'Resend Verification',
        success: 'Verification email sent.'
      });
    } catch (e) {
      if (e.message.startsWith('VERIFY_RESEND_COOLDOWN')) {
        const mins = e.message.split(':')[1];
        return res.status(429).render('pages/resend-verification', {
          title: 'Resend Verification',
          error: `Please wait ${mins} minute(s) before requesting again.`
        });
      }
      throw e;
    }
  } catch {
    res.status(500).render('pages/resend-verification', {
      title: 'Resend Verification',
      error: 'Request failed'
    });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

module.exports = router;
