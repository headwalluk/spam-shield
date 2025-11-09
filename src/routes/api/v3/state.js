const express = require('express');
const router = express.Router();
const config = require('../../../config');

/**
 * @openapi
 * /api/v3/state:
 *   get:
 *     summary: UI navigation / sitemap state
 *     description: Returns a navigation model (buttons + optional tiles) describing what sections the current (or anonymous) user can access based on authentication state and roles. Public endpoint for dynamic front-end rendering.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', (req, res) => {
  const isAuthenticated =
    typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : !!req.user;
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  /** @type {{ text: string; type: string; url: string, tiles?: { text: string; iconClasses: string; url: string }[] }[]} */
  const sitemap = [];

  if (!isAuthenticated) {
    sitemap.push({ text: 'Login', type: 'btn-primary', url: '/login' });
    if (config.auth.enableRegistration) {
      sitemap.push({ text: 'Register', type: 'btn', url: '/register' });
    }
  } else {
    sitemap.push({
      text: 'Dashboard',
      type: 'btn btn-outline-primary',
      url: '/dash',
      tiles: [
        {
          text: 'API Keys',
          iconClasses: 'bi bi-key-fill display-3',
          url: '/dash/api-keys'
        },
        {
          text: 'Security',
          iconClasses: 'bi bi-shield-lock-fill display-3',
          url: '/dash/security'
        }
      ]
    });
    if (roles.includes('administrator')) {
      sitemap.push({
        text: 'Admin',
        type: 'btn btn-outline-danger',
        url: '/admin',
        tiles: [
          {
            text: 'Users',
            iconClasses: 'bi bi-people-fill display-3',
            url: '/admin/users'
          },
          {
            text: 'Countries',
            iconClasses: 'bi bi-globe2 display-3',
            url: '/admin/countries'
          },
          {
            text: 'Bad Phrases',
            iconClasses: 'bi bi-exclamation-triangle-fill display-3',
            url: '/admin/bad-phrases'
          },
          {
            text: 'Salutations',
            iconClasses: 'bi bi-hand-thumbs-up display-3',
            url: '/admin/salutations'
          }
        ]
      });
    }
  }

  res.json({ isAuthenticated, sitemap });
});

module.exports = router;
