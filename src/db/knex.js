const knex = require('knex');
const config = require('../config');

const db = knex({
  client: 'mysql2',
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    timezone: 'Z'
  },
  pool: { min: 0, max: 10 }
});

module.exports = db;
