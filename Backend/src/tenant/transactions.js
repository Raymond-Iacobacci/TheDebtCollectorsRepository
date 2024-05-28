const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery, getDate } = require('../utils');

transactionsRouter.use(express.json());

const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';

transactionsRouter.get('/get-ledger', async(req, res) =>{
  try {
      tenantID = req.query['tenant-id'];
  
      ledger = await executeQuery(`SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=${'0x' + tenantID}`);
      
      res.send(ledger);

  } catch (error) {
      res.status(500).json({ error: error });
  }
});

async function updatePayment(amount){
  let newCharge = 0;
  let subtractAmount = 0;
  do {
      const oldestCharge = await executeQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 LIMIT 1`);
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

transactionsRouter.post('/make-payment', async(req, res)=>{
  try{
      const tenantID = req.query['tenant-id'];
      const description = req.body.description;
      let amount = req.body.amount;
      amount = Number(amount);
      const currentDate = getDate();

      const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
      const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
      const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`);
      // console.log(`This is the amount: ${amount}`);
      // console.log(chargeBalance[0].amount-paymentBalance[0].amount)
      let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
      balance =  balance - amount;

      updatePayment(amount);
      
      const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [payment, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance];
      await executeQuery(query, values);
      
      res.send(currentDate);
  }catch(error){
      res.status(500).json({ error: error.message });
  
  }
});


module.exports = transactionsRouter;