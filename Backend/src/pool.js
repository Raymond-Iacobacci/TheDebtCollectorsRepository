const mysql = require('mysql');
require('dotenv').config({ path: '../.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit : 1000
  });

const displayConnectionError = (err, res) => {
    console.error('Error getting database connection:', err);
    res.status(500).send('Error getting database connection');
}

const displayQueryError = (queryErr, res) => {
    console.error('Error executing query:', queryErr);
    res.status(500).send('Error executing query');
}

module.exports = {pool, displayConnectionError, displayQueryError};