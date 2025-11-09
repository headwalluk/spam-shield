#!/usr/bin/env node
/**
 * build-dist.js
 * Create production-ready dist/ directory:
 *  - Copies static HTML from public/ (excluding build/ and js/css source)
 *  - Minifies HTML files
 *  - Copies already-built optimized assets from public/build
 *  - Copies favicon/images
 *  - Produces a dist/manifest.json including hashes for cache busting
 */

const path = require('path');
const fs = require('fs-extra');
const nodeCrypto = require('crypto');
const { minify } = require('html-minifier-terser');

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

async function hashFile(filePath) {
  const buf = await fs.readFile(filePath);
  const hash = nodeCrypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  return hash;
}

async function copyAndMinifyHtml(srcFile, destFile) {
  const html = await fs.readFile(srcFile, 'utf8');
  const minified = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });
  await fs.outputFile(destFile, minified, 'utf8');
}

async function build() {
  console.log('[dist] Cleaning dist directory');
  await fs.remove(distDir);
  await fs.ensureDir(distDir);

  console.log('[dist] Copying and minifying HTML');
  // Walk public/ recursively to find .html files
  const htmlFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip build directory; assets handled separately
        if (
          path.basename(full) === 'build' ||
          path.basename(full) === 'js' ||
          path.basename(full) === 'css'
        ) {
          continue;
        }
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles.push(full);
      }
    }
  }
  walk(publicDir);

  for (const file of htmlFiles) {
    const rel = path.relative(publicDir, file);
    const dest = path.join(distDir, rel);
    await copyAndMinifyHtml(file, dest);
    console.log(`[dist] HTML: ${rel}`);
  }

  console.log('[dist] Copying build assets');
  const buildSrc = path.join(publicDir, 'build');
  const buildDest = path.join(distDir, 'build');
  await fs.copy(buildSrc, buildDest);

  console.log('[dist] Copying images & root assets');
  const rootAssets = ['headwall-icon.webp'];
  for (const asset of rootAssets) {
    const src = path.join(publicDir, asset);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(distDir, asset));
      console.log(`[dist] Asset: ${asset}`);
    }
  }

  // Copy flags directory if present (SVG country flags)
  const flagsSrc = path.join(publicDir, 'flags');
  if (await fs.pathExists(flagsSrc)) {
    const flagsDest = path.join(distDir, 'flags');
    await fs.copy(flagsSrc, flagsDest);
    console.log('[dist] Copied flags/ directory');
  }

  console.log('[dist] Generating manifest.json with hashes');
  const manifest = { generatedAt: new Date().toISOString(), assets: [] };
  async function addAsset(relPath) {
    const full = path.join(distDir, relPath);
    const hash = await hashFile(full);
    manifest.assets.push({ file: relPath, hash });
  }

  // Add build assets and HTML files to manifest
  for (const file of htmlFiles) {
    await addAsset(path.relative(publicDir, file));
  }
  const buildFiles = fs.readdirSync(buildDest);
  for (const bf of buildFiles) {
    const rel = path.join('build', bf);
    if (fs.statSync(path.join(buildDest, bf)).isFile()) {
      await addAsset(rel);
    }
  }
  await fs.writeJson(path.join(distDir, 'manifest.json'), manifest, { spaces: 2 });
  console.log('[dist] Done');
}

build().catch((err) => {
  console.error('[dist] Build failed', err);
  process.exit(1);
});
