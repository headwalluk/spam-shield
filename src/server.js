// Load env early so config sees .env
require('dotenv').config();
const express = require('express');
const app = require('./app');
const config = require('./config');
const knexConfig = require('../knexfile');
const Knex = require('knex');
const ensureDevSeed = require('./db/ensureDevSeed');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// In production, ensure required built assets exist before starting the server
function verifyProdAssets() {
  if (config.env !== 'production') {
    return;
  }
  const projectRoot = path.join(__dirname, '..');
  const candidateDirs = [
    path.join(projectRoot, 'dist', 'build'),
    path.join(projectRoot, 'public', 'build')
  ];
  const buildDir = candidateDirs.find((d) => fs.existsSync(d)) || candidateDirs[1];
  const required = ['bundle.css', 'bundle.js'];
  const missing = required.filter((f) => !fs.existsSync(path.join(buildDir, f)));
  if (missing.length) {
    console.error(
      `[production] Missing built assets: ${missing.join(
        ', '
      )}. Please run "npm run build" before starting the server.`
    );
    process.exit(1);
  }
  // Optional page-specific bundles (warn if absent)
  const optional = ['dashboard.bundle.js'];
  const missingOptional = optional.filter((f) => !fs.existsSync(path.join(buildDir, f)));
  if (missingOptional.length) {
    console.warn(
      `[production] Optional bundles not found: ${missingOptional.join(
        ', '
      )}. Some pages may lack enhanced JS until built.`
    );
  }
  // Ensure manifest exists
  const manifestPath = path.join(buildDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('[production] Asset manifest.json missing. Run "npm run build" first.');
    process.exit(1);
  }
  // Fail if any source maps are present
  const mapFiles = fs.readdirSync(buildDir).filter((f) => f.endsWith('.map'));
  if (mapFiles.length) {
    console.error(
      `[production] Source map files detected (${mapFiles.join(', ')}). Production build must exclude maps. Re-run build without maps.`
    );
    process.exit(1);
  }
}

async function ensureDatabaseExists() {
  const { host, user, password, database } = config.db;
  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, multipleStatements: true });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  } catch (err) {
    console.warn('Database preflight skipped/failed:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function start() {
  verifyProdAssets();
  // Auto-run migrations in development
  if (config.env === 'development') {
    // Attempt to create database if missing
    await ensureDatabaseExists();
    const knex = Knex(knexConfig.development);
    try {
      await knex.migrate.latest();
      console.log('Migrations applied successfully');
      // Ensure development baseline data without wiping existing data
      await ensureDevSeed(knex);
    } catch (err) {
      console.error('Migration failed:', err.message);
      // Abort startup in dev if we cannot migrate
      process.exit(1);
    } finally {
      await knex.destroy();
    }
  }

  const server = express();
  server.use(app);
  server.listen(config.server.listenPort, () => {
    console.log(
      `[${config.env}] Server is running on http://localhost:${config.server.listenPort}`
    );
  });
}

start();
