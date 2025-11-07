// Knex configuration for migrations and seeds
// Uses the application's config in src/config/index.js
require('dotenv').config();

const appConfig = require('./src/config');

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: appConfig.db.host,
      user: appConfig.db.user,
      password: appConfig.db.password,
      database: appConfig.db.database,
      timezone: 'Z', // UTC
      multipleStatements: true
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
