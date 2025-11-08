const express = require('express');
const router = express.Router();
const config = require('../../../config');

// GET /api/v3/state
// Public endpoint to expose UI navigation options based on auth/roles
router.get('/', (req, res) => {
  const isAuthenticated =
    typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : !!req.user;
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  /** @type {{ text: string; type: string; url: string }[]} */
  const sitemap = [];

  if (!isAuthenticated) {
    sitemap.push({ text: 'Login', type: 'btn-primary', url: '/login' });
    if (config.auth.enableRegistration) {
      sitemap.push({ text: 'Register', type: 'btn', url: '/register' });
    }
  } else {
    sitemap.push({ text: 'Dashboard', type: 'btn btn-primary', url: '/dash' });
    sitemap.push({ text: 'API Keys', type: 'btn', url: '/dash/api-keys' });
    if (roles.includes('administrator')) {
      sitemap.push({ text: 'Admin', type: 'btn btn-danger', url: '/admin' });
    }
  }

  res.json({ isAuthenticated, sitemap });
});

module.exports = router;
