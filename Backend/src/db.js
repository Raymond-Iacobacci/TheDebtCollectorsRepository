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

const executeQuery = (query, values = []) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      connection.query(query, values, (queryErr, results) => {
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

const selectQuery = (query) => {
  return executeQuery(query);
};

const insertQuery = (query, values) => {
  return executeQuery(query, values);
};

const uuidToString = (buffer) => {
  if(buffer){
    return '0x' + buffer.toString('hex').toUpperCase();
  }
  return null;
}
  
module.exports = {pool, selectQuery, insertQuery, executeQuery, uuidToString};