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

const uuidToString = (buffer) => {
    if(buffer){
      return '0x' + buffer.toString('hex').toUpperCase();
    }
    return null;
  }
  
  const selectQuery = (query) => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(query, (queryErr, results) => {
          connection.release();
          if (queryErr) {
            reject(queryErr);
            return;
          }
          resolve(results);
        });
      });
    });
  };
  

module.exports = {pool, selectQuery, uuidToString, displayConnectionError, displayQueryError};