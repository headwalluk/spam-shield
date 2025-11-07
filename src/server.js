// Load env early so config sees .env
require('dotenv').config();
const express = require('express');
const app = require('./app');
const config = require('./config');
const knexConfig = require('../knexfile');
const Knex = require('knex');
const ensureDevSeed = require('./db/ensureDevSeed');
const mysql = require('mysql2/promise');

console.log(`Starting Spam Shield application NODE_ENV=${process.env.NODE_ENV}`);

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
