const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery, getDate } = require('../utils');

transactionsRouter.use(express.json());

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


module.exports = transactionsRouter;