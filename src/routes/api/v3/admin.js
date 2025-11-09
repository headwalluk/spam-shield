const express = require('express');
const router = express.Router();
const usersRouter = require('./admin/users');
const rolesRouter = require('./admin/roles');
const userStatusesRouter = require('./admin/user-statuses');

/**
 * Authorization middleware for admin routes.
 * Assumes authentication (session or API key) has already been handled upstream.
 * This middleware simply checks if the authenticated user has the 'administrator' role.
 */
function isAdmin(req, res, next) {
  // Upstream middleware should have populated req.user if authenticated
  if (req.user && req.user.roles && req.user.roles.includes('administrator')) {
    return next();
  }
  // If there's no user or they are not an admin, deny access.
  // Use 403 Forbidden as the user might be authenticated but lacks permissions.
  return res.status(403).send('Forbidden');
}

// Protect all admin routes with the isAdmin authorization middleware
router.use(isAdmin);

// Delegate users CRUD under /api/v3/admin/users
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/user-statuses', userStatusesRouter);

module.exports = router;
