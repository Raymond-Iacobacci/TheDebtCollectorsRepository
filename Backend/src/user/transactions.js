const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery} = require('../utils');

transactionsRouter.use(express.json());

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