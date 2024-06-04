const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery } = require('../utils');

transactionsRouter.use(express.json());

/* 
  Description: Given a tenant, return all the transactions for the tenant
  input: tenant-id
  output: array of json objects (transactions: payments, charges, credits)
*/
transactionsRouter.get('/get-ledger', async(req, res) =>{
  try {
      tenantID = '0x' + req.query['tenant-id'];
      ledger = await executeQuery(`SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=${tenantID}`);
      res.send(ledger);
  } catch (error) {
      res.status(500).json({ error: error });
  }
});

module.exports = transactionsRouter;