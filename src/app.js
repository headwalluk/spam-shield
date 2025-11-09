/**
 * Main application file
 */

console.log(`Starting Spam Shield application NODE_ENV=${process.env.NODE_ENV}`);

const express = require('express');
const path = require('path');
const fs = require('fs');
// const morgan = require('morgan');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api/index');
const webRoutes = require('./routes/web/index');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middleware/errorHandler');
const session = require('express-session');
// connect-session-knex v3 exports the class directly instead of a factory
const { ConnectSessionKnexStore } = require('connect-session-knex');
const config = require('./config');
const passport = require('./middleware/passport');
const db = require('./db/knex');

const app = express();

// Middleware setup
// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session & Passport (cookie auth)
// Use DB-backed session store in non-test environments to persist sessions
const useDbSessionStore = config.env !== 'test';
const store = useDbSessionStore
  ? new ConnectSessionKnexStore({
      knex: db,
      tablename: 'web_sessions', // dedicated table for express-session store
      createtable: true,
      clearInterval: 600000 // clear expired sessions every 10 minutes
    })
  : undefined; // Jest/test uses MemoryStore to avoid DB dependency

app.use(
  session({
    name: config.auth.sessionCookieName,
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax'
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// (Static HTML front-end now; no server-side view engine)
app.use((req, _res, next) => {
  // Keep a lightweight hook if future middleware needs user/config
  req._ui = { user: req.user, enableRegistration: config.auth.enableRegistration };
  next();
});

// Static files: prefer /dist if present, else /public (both at project root)
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(publicDir));

// Swagger API docs (UI)
// Primary path: /doc/api
app.use('/doc/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Raw spec JSON (keep stable URL and add new alias)
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});
app.get('/doc/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Route integration
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
