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

// Global trailing-slash canonicalization for HTML routes
// - Skip root '/'
// - Skip APIs '/api*'
// - Skip partials '/partials/*' (fragments)
// - If path ends with '/', redirect to non-slash variant
app.use((req, res, next) => {
  const p = req.path || '/';
  if (
    p === '/' ||
    p.startsWith('/api') ||
    p.startsWith('/partials/') ||
    p === '/doc/api/' ||
    p.startsWith('/doc/api/') // allow swagger trailing slash path
  ) {
    return next();
  }
  if (p.length > 1 && /\/$/.test(p)) {
    const target = p.replace(/\/+$/, '');
    return res.redirect(301, target);
  }
  next();
});

// Theme injection middleware: for HTML responses only, rewrite opening <html ...> tag
// based on cookie `theme` before sending. Keeps initial paint consistent without inline script.
// Remove old theme injection (replaced by unified override below)
// Theme injection: override res.send and res.sendFile so static HTML served via express.static or sendFile is rewritten.
app.use((req, res, next) => {
  // Load theme cookie early each request
  const rawCookie = req.headers.cookie || '';
  const match = /(?:^|; )theme=([^;]+)/.exec(rawCookie);
  let theme = match ? decodeURIComponent(match[1]) : 'light';
  let defaulted = !match; // default if cookie missing
  if (theme === 'auto' || !['light', 'dark'].includes(theme)) {
    theme = 'light';
    defaulted = true;
  }
  // Attach for later middlewares/static handler consumption
  req._uiTheme = theme;
  req._uiThemeWasDefaulted = defaulted;
  next();
});

// HTML rewrite utility
function themeRewrite(body, theme) {
  if (typeof body !== 'string') {
    return body;
  }
  const htmlTagMatch = body.match(/<html\b[^>]*>/i);
  if (!htmlTagMatch) {
    return body;
  }
  const originalTag = htmlTagMatch[0];
  let newTag;
  if (/data-bs-theme=/i.test(originalTag)) {
    newTag = originalTag.replace(/data-bs-theme=".*?"/i, `data-bs-theme="${theme}"`);
  } else {
    newTag = originalTag.replace(/>$/, ` data-bs-theme="${theme}">`);
  }
  return body.replace(originalTag, newTag);
}

// Buffer and rewrite HTML served via express.static by intercepting write/end for likely-HTML paths
app.use((req, res, next) => {
  // Fast skip for assets and API
  if (
    /\.(js|css|woff2?|png|jpg|jpeg|svg|webp|json)$/.test(req.path) ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/partials/')
  ) {
    return next();
  }
  // Heuristic: buffer if path is '/' or ends with .html or has no dot in last segment
  const last = req.path.split('?')[0];
  const lastSeg = last.split('/').pop() || '';
  const isLikelyHtml =
    last === '/' ||
    last.endsWith('/') ||
    /\.html$/i.test(last) ||
    (!lastSeg.includes('.') && lastSeg !== '');
  if (!isLikelyHtml) {
    return next();
  }

  const theme = req._uiTheme || 'light';
  const chunks = [];
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);

  res.write = (chunk, encoding, cb) => {
    try {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      if (typeof cb === 'function') {
        cb();
      }
      return true;
    } catch {
      return origWrite(chunk, encoding, cb);
    }
  };

  res.end = (chunk, encoding, cb) => {
    if (chunk) {
      try {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      } catch {
        // ignore buffering error
      }
    }
    try {
      const buf = Buffer.concat(chunks);
      let body = buf.toString('utf8');
      if (body.includes('<html')) {
        body = themeRewrite(body, theme);
        // If theme was defaulted (no/auto cookie), set a cookie to stabilize subsequent requests
        try {
          if (req._uiThemeWasDefaulted) {
            const parts = [
              `theme=${encodeURIComponent(theme)}`,
              'Path=/',
              'Max-Age=34560000',
              'SameSite=Lax'
            ];
            if (config.env === 'production') {
              parts.push('Secure');
            }
            // Avoid HttpOnly so client-side toggle can update it
            res.append('Set-Cookie', parts.join('; '));
          }
        } catch {
          // ignore cookie set failure
        }
        // Update Content-Length if set
        try {
          res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'));
        } catch {
          // ignore header length set failure
        }
        return origEnd(body, 'utf8', cb);
      }
      // Not HTML content: flush original bytes
      try {
        res.setHeader('Content-Length', buf.length);
      } catch {
        // ignore header length set failure
      }
      return origEnd(buf, cb);
    } catch {
      // fall through on unexpected errors
    }
    return origEnd(chunk, encoding, cb);
  };
  next();
});

// HTML compose/minify/caching (works in dev and prod) + Static files
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
const useDist = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);
const staticRoot = useDist ? distDir : publicDir;
// Inline partials and minify with in-memory cache
const htmlCompose = require('./middleware/htmlCompose');
app.use(htmlCompose(staticRoot));
// Serve remaining static assets
app.use(
  express.static(staticRoot, {
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // HTML is composed by middleware; ensure no caching of raw static file
        res.setHeader('Cache-Control', 'no-store');
      }
    }
  })
);

// Swagger API docs (UI)
// Restore default behavior (swagger will redirect /doc/api -> /doc/api/) and we exclude /doc/api/ from canonical stripping.
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
