/**
 * Application configuration normalisation.
 */
const validEnvironments = ['development', 'test', 'production'];
let rawNodeEnv = (process.env.NODE_ENV || '').toLowerCase();
if (!validEnvironments.includes(rawNodeEnv)) {
  rawNodeEnv = 'development';
}

if (rawNodeEnv !== process.env.NODE_ENV) {
  console.log(`Normalizing NODE_ENV from '${process.env.NODE_ENV}' to '${rawNodeEnv}'`);
  process.env.NODE_ENV = rawNodeEnv;
}

// Normalize NODE_APP_INSTANCE for PM2 cluster mode
// PM2 sets this to identify each instance (0, 1, 2, etc.)
if (process.env.NODE_APP_INSTANCE === undefined) {
  process.env.NODE_APP_INSTANCE = '0';
}

module.exports = {
  env: process.env.NODE_ENV,
  instance: process.env.NODE_APP_INSTANCE,
  server: {
    listenPort: Number(process.env.LISTEN_PORT) || 8080
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'spamshield'
  },
  api: {
    prefix: '/api'
  },
  web: {
    title: 'Spam Shield',
    description: 'A web application for spam detection and IP reputation management.'
  },
  auth: {
    enableRegistration: (process.env.AUTH_ENABLE_REGISTRATION || 'true').toLowerCase() !== 'false',
    sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-secret',
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'sid',
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
    resetTokenTTLMinutes: Number(process.env.RESET_TOKEN_TTL_MINUTES || 60),
    verifyEmailTokenTTLMinutes: Number(process.env.VERIFY_EMAIL_TOKEN_TTL_MINUTES || 60),
    verifyEmailResendCooldownMinutes: Number(process.env.VERIFY_EMAIL_RESEND_COOLDOWN_MINUTES || 5),
    passwordPolicy: {
      minLength: Number(process.env.PASSWORD_MIN_LENGTH || 12),
      requireUpper: (process.env.PASSWORD_REQUIRE_UPPER || 'true').toLowerCase() === 'true',
      requireLower: (process.env.PASSWORD_REQUIRE_LOWER || 'true').toLowerCase() === 'true',
      requireDigit: (process.env.PASSWORD_REQUIRE_DIGIT || 'true').toLowerCase() === 'true',
      requireSymbol: (process.env.PASSWORD_REQUIRE_SYMBOL || 'true').toLowerCase() === 'true',
      symbols: process.env.PASSWORD_SYMBOLS || '!@#$%^&*()-_=+[]{};:,.<>/?',
      generateLength: Number(
        process.env.PASSWORD_GENERATE_LENGTH || process.env.PASSWORD_MIN_LENGTH || 16
      )
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'no-reply@spamshield.local'
    },
    baseUrl:
      process.env.APP_BASE_URL || `http://localhost:${Number(process.env.LISTEN_PORT) || 8080}`
  }
};
