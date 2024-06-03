const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery, getDate, getBalance } = require('../utils');

transactionsRouter.use(express.json());

const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';

/*
  Iterates through all the pending charges and covers the charge amount based on the payment amount. 
*/
async function updatePayment(amount, tenantID){
  let newCharge = 0;
  let subtractAmount = 0;
  do {
      const oldestCharge = await executeQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 AND tenantID=${'0x'+tenantID} LIMIT 1 `);
      if (oldestCharge.length === 0) {
          break;
      }
      newCharge = oldestCharge[0].oldestCharge;
      subtractAmount = Math.min(oldestCharge[0].oldestCharge, amount);
      newCharge -= subtractAmount;
      amount -= subtractAmount;
      await executeQuery(`UPDATE paymentsLedger SET paidAmount=${newCharge} WHERE id=${oldestCharge[0].id}`);
  } while (amount != 0);
}

/* 
  Description: Tenant will make a payment.
  input: tenantID, description, amount
  output: current date 
*/
transactionsRouter.post('/make-payment', async(req, res)=>{
  try{
    const tenantID = req.query['tenant-id'];
    const description = req.body.description;
    let amount = req.body.amount;
    amount = Number(amount);
    const currentDate = getDatePayment();

    let balance = await getBalance(tenantID);
    balance =  balance - amount;

    updatePayment(amount, tenantID);
    
    const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [payment, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance];
    await executeQuery(query, values);
    
    res.send(currentDate);
  }catch(error){
      res.status(500).json({ error: error.message });
  }
});

module.exports = transactionsRouter;