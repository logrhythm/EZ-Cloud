// Use the MariaDB Node.js Connector
const mariadb = require('mariadb');

// Reload the .env conf here, only for the Mocha test to benefit from it
require('dotenv').config();

// Create a connection pool
const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_DB
});

// Expose a method to establish connection with MariaDB
module.exports = Object.freeze({
  pool
});
