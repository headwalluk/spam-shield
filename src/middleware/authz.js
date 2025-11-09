/**
 * Simple authorization helpers for API routes
 */
function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ error: 'unauthenticated' });
}

function requireAdmin(req, res, next) {
  if (req.user && Array.isArray(req.user.roles) && req.user.roles.includes('administrator')) {
    return next();
  }
  return res.status(403).json({ error: 'forbidden' });
}

function requireUserRole(req, res, next) {
  if (req.user && Array.isArray(req.user.roles) && req.user.roles.includes('user')) {
    return next();
  }
  if (!req.user) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  return res.status(403).json({ error: 'forbidden' });
}

module.exports = { requireAuth, requireAdmin, requireUserRole };
