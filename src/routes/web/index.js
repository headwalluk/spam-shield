const express = require('express');
const keysRouter = require('./keys');
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
  return fs.existsSync(distDir) ? distDir : publicDir;
}

// Extensionless routes for static pages
router.get('/login', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'login.html'));
});

router.get('/dash', (_req, res) => {
  // Serve dashboard index
  res.sendFile(path.join(getStaticRoot(), 'dash', 'index.html'));
});

router.get('/dash/api-keys', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'dash', 'api-keys.html'));
});

router.get('/admin', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'index.html'));
});

router.get('/admin/users', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'admin', 'users.html'));
});

router.get('/register', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'register.html'));
});

router.get('/reset-password', (_req, res) => {
  res.sendFile(path.join(getStaticRoot(), 'reset-password.html'));
});

// Placeholder until verify-email page exists
router.get('/verify-email', (_req, res) => res.redirect('/'));

// Back-compat: redirect .html URLs to extensionless routes
router.get('/index.html', (_req, res) => res.redirect(301, '/'));
router.get('/login.html', (_req, res) => res.redirect(301, '/login'));
router.get('/admin/index.html', (_req, res) => res.redirect(301, '/admin'));
router.get('/admin/users.html', (_req, res) => res.redirect(301, '/admin/users'));
router.get('/dash/index.html', (_req, res) => res.redirect(301, '/dash'));
router.get('/dash/api-keys.html', (_req, res) => res.redirect(301, '/dash/api-keys'));
router.post('/logout', (req, res) => {
  req.logout(() => res.status(204).send());
});

// Back-compat for new pages (in case .html variants were bookmarked earlier)
router.get('/register.html', (_req, res) => res.redirect(301, '/register'));
router.get('/reset-password.html', (_req, res) => res.redirect(301, '/reset-password'));

// Retain existing nested router for key management actions (API-style POSTs)
router.use('/keys', keysRouter);

module.exports = router;
