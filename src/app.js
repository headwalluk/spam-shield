/**
 * Main application file
 */
console.log(`Starting Spam Shield application NODE_ENV=${process.env.NODE_ENV}`);
const express = require('express');
const path = require('path');
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

// Expose common locals to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.enableRegistration = config.auth.enableRegistration;
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Swagger API docs (UI)
app.use('/docs/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Raw spec JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Route integration
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
