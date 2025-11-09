#!/usr/bin/env node
/*
 Simple sanity check: ensure public HTML files include /build/bundle.js before any page bundle scripts.
 Rules:
  - Each HTML must include /build/bundle.js if it includes any other /build/*.bundle.js
  - If both are present, bundle.js must appear earlier in document order
 Exits with code 1 if a violation is found.
*/

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function listHtmlFiles(dir) {
  const out = [];
  (function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) {
        continue;
      }
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(p);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
        out.push(p);
      }
    }
  })(dir);
  return out;
}

function extractScripts(html) {
  const re = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  const list = [];
  let m;
  while ((m = re.exec(html))) {
    list.push(m[1]);
  }
  return list;
}

function verifyFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = extractScripts(html);
  const hasPageBundles = scripts.some((s) => /\/build\/.+\.bundle\.js$/.test(s));
  const bundleIndex = scripts.findIndex((s) => s.endsWith('/build/bundle.js'));
  if (!hasPageBundles) {
    return { ok: true };
  }
  if (bundleIndex === -1) {
    return { ok: false, reason: 'Missing /build/bundle.js', scripts };
  }
  // Ensure all page bundles come after bundle.js
  const violations = scripts
    .map((s, idx) => ({ s, idx }))
    .filter(({ s, idx }) => /\/build\/.+\.bundle\.js$/.test(s) && idx < bundleIndex)
    .map(({ s }) => s);
  if (violations.length) {
    return {
      ok: false,
      reason: `Page bundles before bundle.js: ${violations.join(', ')}`,
      scripts
    };
  }
  return { ok: true };
}

function main() {
  const files = listHtmlFiles(PUBLIC_DIR);
  const failed = [];
  for (const f of files) {
    const res = verifyFile(f);
    if (!res.ok) {
      failed.push({ file: path.relative(process.cwd(), f), reason: res.reason });
    }
  }
  if (failed.length) {
    console.error('[verify-html] Violations found:');
    for (const v of failed) {
      console.error(` - ${v.file}: ${v.reason}`);
    }
    process.exit(1);
  }
  console.log(`[verify-html] OK (${files.length} html files checked)`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('[verify-html] Error:', err.message);
    process.exit(1);
  }
}
