const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery } = require('../utils');

transactionsRouter.use(express.json());

async function getPrevBalance(tenantID, id){
  const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Charge' AND tenantID=${'0x' + tenantID} AND id <= ${id}`);
  const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Payment' AND tenantID=${'0x' + tenantID} AND id <= ${id}`);
  const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='Credit' AND tenantID=${'0x' + tenantID} AND id <= ${id}`);

  let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
  return balance;
}

async function updateBalance(tenantID){
  currLedger = await executeQuery(`SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=${'0x' + tenantID}`);
  for(let entry of currLedger){
    let balance = await getPrevBalance(tenantID, entry.id);
    await executeQuery(`Update paymentsLedger set balance=${balance} where id=${entry.id}`);
  }
}

/* 
  Description: Given a tenant, return all the transactions for the tenant
  input: tenant-id
  output: array of json objects (transactions: payments, charges, credits)
*/
transactionsRouter.get('/get-ledger', async(req, res) =>{
  try {
      tenantID = '0x' + req.query['tenant-id'];
      updateBalance(req.query['tenant-id']);
      ledger = await executeQuery(`SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=${tenantID}`);
      res.send(ledger);
  } catch (error) {
      res.status(500).json({ error: error });
  }
});

module.exports = {transactionsRouter, updateBalance, getPrevBalance};