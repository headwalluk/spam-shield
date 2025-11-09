const express = require('express');
const passport = require('../../middleware/passport');
const v3MessagesRouter = require('./v3/messages');
const v3IpReputationRouter = require('./v3/ip-reputation');
const v3AuthRouter = require('./v3/auth');
const v3AdminRouter = require('./v3/admin');
const v3ApiKeysRouter = require('./v3/api-keys');
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
router.use('/v3/ip-reputation', v3IpReputationRouter);
router.use('/v3/auth', v3AuthRouter);
router.use('/v3/admin', v3AdminRouter);
router.use('/v3/api-keys', v3ApiKeysRouter);
router.use('/v3/state', v3StateRouter);

module.exports = router;
