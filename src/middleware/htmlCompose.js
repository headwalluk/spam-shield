const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const HEADER_RE = /<header\s+id=["']header-placeholder["']><\/header>/i;
const FOOTER_RE = /<footer\s+id=["']footer-placeholder["']><\/footer>/i;

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function statOrNull(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

async function composeAndMinify(htmlSrc, headerSrc, footerSrc) {
  let html = htmlSrc;
  if (headerSrc && HEADER_RE.test(html)) {
    html = html.replace(HEADER_RE, headerSrc.trim());
  }
  if (footerSrc && FOOTER_RE.test(html)) {
    html = html.replace(FOOTER_RE, footerSrc.trim());
  }
  try {
    const minified = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      keepClosingSlash: true
    });
    return minified;
  } catch {
    return html; // fallback without minification
  }
}

/**
 * Middleware to inline header/footer partials into HTML files, minify, and cache in memory.
 * Caches by request path and underlying source mtimes. Works in dev and prod.
 */
function htmlCompose(staticRoot) {
  /** @type {Map<string, { html: string, m1: number, m2: number, m3: number }>} */
  const cache = new Map();

  return async function htmlComposeMiddleware(req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // Normalize to index.html for directory paths and extension-less routes
    let reqPath = req.path;
    if (reqPath.endsWith('/')) {
      reqPath = path.join(reqPath, 'index.html');
    } else {
      // If last segment has no dot, try directory index.html then flat .html fallback
      const lastSeg = reqPath.split('/').pop();
      if (lastSeg && !lastSeg.includes('.')) {
        const dirIndex = path.join(staticRoot, reqPath, 'index.html');
        if (fs.existsSync(dirIndex)) {
          reqPath = path.join(reqPath, 'index.html');
        } else {
          const flatHtml = path.join(staticRoot, `${reqPath}.html`);
          if (fs.existsSync(flatHtml)) {
            reqPath = `${reqPath}.html`;
          }
        }
      }
    }
    if (!reqPath.endsWith('.html')) {
      return next();
    }

    const htmlPath = path.join(staticRoot, reqPath);
    if (!fs.existsSync(htmlPath)) {
      return next();
    }

    const headerPath = path.join(staticRoot, 'partials', 'header.html');
    const footerPath = path.join(staticRoot, 'partials', 'footer.html');

    const s1 = statOrNull(htmlPath)?.mtimeMs || 0;
    const s2 = statOrNull(headerPath)?.mtimeMs || 0;
    const s3 = statOrNull(footerPath)?.mtimeMs || 0;
    const cached = cache.get(reqPath);
    if (cached && cached.m1 === s1 && cached.m2 === s2 && cached.m3 === s3) {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('Cache-Control', 'no-store');
      if (req.method === 'HEAD') {
        return res.end();
      }
      return res.send(cached.html);
    }

    const htmlSrc = safeRead(htmlPath);
    if (htmlSrc == null) {
      return next();
    }
    const headerSrc = safeRead(headerPath);
    const footerSrc = safeRead(footerPath);
    const rendered = await composeAndMinify(htmlSrc, headerSrc, footerSrc);

    cache.set(reqPath, { html: rendered, m1: s1, m2: s2, m3: s3 });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-store');
    if (req.method === 'HEAD') {
      return res.end();
    }
    return res.send(rendered);
  };
}

module.exports = htmlCompose;
