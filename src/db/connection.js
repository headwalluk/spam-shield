const mysql = require('mysql2/promise');
const config = require('../config');

async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    timezone: 'Z', // UTC
    multipleStatements: false
  });
  return connection;
}

module.exports = connectToDatabase;
