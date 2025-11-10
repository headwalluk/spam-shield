const express = require('express');
const passport = require('../../middleware/passport');
const v3MessagesRouter = require('./v3/messages');
const v3IpReputationRouter = require('./v3/ip-reputation');
const v3AuthRouter = require('./v3/auth');
const v3CountriesRouter = require('./v3/countries');
const v3RolesRouter = require('./v3/roles');
const v3UserStatusesRouter = require('./v3/user-statuses');
const v3UsersRouter = require('./v3/users');
const v3ApiKeysRouter = require('./v3/api-keys');
const v3BadPhrasesRouter = require('./v3/bad-phrases');
const v3SalutationsRouter = require('./v3/salutations');
const dashRouter = require('./dash');
const v3StateRouter = require('./v3/state');

const router = express.Router();

/**
 * Global API authentication middleware.
 * If a user is already logged in via session, it does nothing.
 * Otherwise, it attempts to authenticate using an API key from the header.
 * It populates req.user on success but does not block requests without a key,
 * allowing for public API endpoints. Authorization is handled by downstream middleware.
 */
function authenticateApiOptional(req, res, next) {
  // If a session-based user exists, they are already authenticated.
  if (req.isAuthenticated()) {
    return next();
  }

  // In test environment, allow a header-based test user injection to simplify auth in integration tests
  if (process.env.NODE_ENV === 'test') {
    const testRoles = req.header('X-Test-Roles');
    if (testRoles) {
      req.user = {
        id: -1,
        email: 'test@example.com',
        roles: testRoles.split(',').map((r) => r.trim())
      };
      return next();
    }
  }

  // If no session, try API key. This is a non-blocking check.
  passport.authenticate('headerapikey', { session: false }, (err, user, _info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      // Manually attach user to the request for this request lifecycle.
      req.user = user;
    }
    next();
  })(req, res, next);
}

// Apply the optional authentication middleware to all API routes
router.use(authenticateApiOptional);

router.use('/v3/messages', v3MessagesRouter);
// Mount IP reputation at /v3 to provide /api/v3/ip/:ip and /api/v3/ip/:ip/event
router.use('/v3', v3IpReputationRouter);
router.use('/v3/auth', v3AuthRouter);
// New top-level resource mounts (no /admin prefix)
router.use('/v3/countries', v3CountriesRouter);
router.use('/v3/roles', v3RolesRouter);
router.use('/v3/user-statuses', v3UserStatusesRouter);
router.use('/v3/users', v3UsersRouter);
router.use('/v3/api-keys', v3ApiKeysRouter);
router.use('/v3/state', v3StateRouter);
router.use('/v3/bad-phrases', v3BadPhrasesRouter);
router.use('/v3/salutations', v3SalutationsRouter);
// Dashboard-specific helper APIs
router.use('/dash', dashRouter);

module.exports = router;
