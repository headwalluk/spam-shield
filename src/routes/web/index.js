const express = require('express');
// Legacy admin router used SSR; static routes below replace it
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Resolve static root consistent with app.js (prefer dist/, else public/)
function getStaticRoot() {
  // __dirname is src/routes/web -> project root is three levels up
  const projectRoot = path.join(__dirname, '..', '..', '..');
  const distDir = path.join(projectRoot, 'dist');
  const publicDir = path.join(projectRoot, 'public');
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && fs.existsSync(distDir)) {
    return distDir;
  }
  return publicDir;
}

// Extensionless routes for static pages
router.get('/login', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'login.html'));
});

router.get('/dash', (_req, res) => {
  // Serve dashboard index
  res.sendFile(path.join(getStaticRoot(), 'dash', 'index.html'));
});

// Normalize trailing slashes for key entry points

router.get('/dash/api-keys', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'dash', 'api-keys.html'));
});

router.get('/dash/security', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'dash', 'security.html'));
});
router.get('/dash/messages', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'dash', 'messages.html'));
});

router.get('/admin', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'index.html'));
});

router.get('/admin/users', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'users.html'));
});

router.get('/admin/countries', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'countries.html'));
});
router.get('/admin/salutations', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'salutations.html'));
});

router.get('/admin/bad-phrases', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'bad-phrases.html'));
});

router.get('/register', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'register.html'));
});

router.get('/reset-password', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'reset-password.html'));
});

router.get('/doc', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'doc', 'index.html'));
});

// Placeholder until verify-email page exists
router.get('/verify-email', (_req, res) => res.redirect('/'));

// Back-compat: redirect .html URLs to extensionless routes
router.get('/index.html', (_req, res) => res.redirect(301, '/'));
router.get('/login.html', (_req, res) => res.redirect(301, '/login'));
router.get('/admin/index.html', (_req, res) => res.redirect(301, '/admin'));
router.get('/admin/users.html', (_req, res) => res.redirect(301, '/admin/users'));
router.get('/admin/countries.html', (_req, res) => res.redirect(301, '/admin/countries'));
router.get('/admin/salutations.html', (_req, res) => res.redirect(301, '/admin/salutations'));
router.get('/admin/bad-phrases.html', (_req, res) => res.redirect(301, '/admin/bad-phrases'));
router.get('/dash/index.html', (_req, res) => res.redirect(301, '/dash'));
router.get('/dash/api-keys.html', (_req, res) => res.redirect(301, '/dash/api-keys'));
router.get('/dash/messages.html', (_req, res) => res.redirect(301, '/dash/messages'));
router.post('/logout', (req, res) => {
  req.logout(() => res.status(204).send());
});

// Back-compat for new pages (in case .html variants were bookmarked earlier)
router.get('/register.html', (_req, res) => res.redirect(301, '/register'));
router.get('/reset-password.html', (_req, res) => res.redirect(301, '/reset-password'));
router.get('/doc/index.html', (_req, res) => res.redirect(301, '/doc'));

module.exports = router;
