const mysql = require('mysql');
const axios = require('axios');
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
          return queryErr;
        }
        resolve(results);
      });
    });
  });
};

const uuidToString = (buffer) => {
  if(buffer){
    return '0x' + buffer.toString('hex').toUpperCase();
  }
  return null;
}

async function sendEmail(recipient, subject, text) {
    try {
        const url = 'https://us-central1-thedebtcollectors.cloudfunctions.net/send-email';
        const response = await axios.post(url, {
            recipient: recipient,
            subject: subject,
            text: text
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

function getDate() {
  const moment = require("moment-timezone");
  return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}

async function getUserType(userID) {
  const tenantResults = await executeQuery(`SELECT tenantID FROM tenants WHERE tenantID = ${userID};`);
  if (tenantResults.length > 0) {
      return 'tenant';
  }
  const managerResults = await executeQuery(`SELECT managerID FROM managers WHERE managerID = ${userID};`);
  if (managerResults.length > 0) {
      return 'manager';
  }
  return null; 
}

async function getBalance(tenantID){
  const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=${'0x' + tenantID}`);
  const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=${'0x' + tenantID}`);
  const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=${'0x' + tenantID}`);

  let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
  return balance;
}
  
module.exports = {pool, executeQuery, uuidToString, sendEmail, getDate, getUserType, getBalance};