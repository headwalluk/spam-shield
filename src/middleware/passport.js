const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const HeaderAPIKeyStrategy = require('passport-headerapikey').HeaderAPIKeyStrategy;
const authService = require('../services/authService');
const userModel = require('../models/userModel');
const config = require('../config');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return done(null, false);
    }
    // Attach roles for downstream authorization & /me endpoint
    const roles = await userModel.getRoles(id);
    user.roles = roles.map((r) => r.name);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await authService.verifyPassword(email, password);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        if (user.__blockedReason) {
          const reason =
            user.__blockedReason === 'EMAIL_NOT_VERIFIED'
              ? 'Email not verified'
              : 'Account inactive';
          return done(null, false, { message: reason, code: user.__blockedReason });
        }
        // Eagerly load roles so login response (if it serializes user before deserialize) can include them
        const roles = await userModel.getRoles(user.id);
        user.roles = roles.map((r) => r.name);
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);

passport.use(
  new HeaderAPIKeyStrategy(
    { header: config.auth.apiKeyHeader, prefix: '' },
    false,
    async (apiKey, done) => {
      try {
        const user = await authService.authenticateApiKey(apiKey);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);

module.exports = passport;
