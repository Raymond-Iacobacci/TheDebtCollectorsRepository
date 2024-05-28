const express = require('express');
const transactionsRouter = express.Router();
const { executeQuery } = require('../utils');

transactionsRouter.use(express.json());

const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';

transactionsRouter.post("/create-credit", async(req, res) =>{
  try {  
    const tenantID = req.body.tenantID;
    const description = req.body.description;
    const amount = req.body.amount;
    const currentDate = getDate();
    
    const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
    const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
    const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`)
  
    let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0)-Number(creditBalance[0].amount || 0);
    balance =  balance -Number(amount);
    updatePayment(amount);
    const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [credit, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance, 0];
    await executeQuery(query, values);
    res.send(200);
    }catch(error){
      res.status(500).json({ error: error });
    }
  });  

async function updatePayment(amount){
  let newCharge = 0;
  let subtractAmount = 0;
  while (amount > 0) {
      const oldestCharge = await executeQuery(`SELECT paidAmount AS oldestCharge, id FROM paymentsLedger WHERE type='Charge' AND paidAmount > 0 LIMIT 1`);
      if (oldestCharge.length === 0) {
          break;
      }
      newCharge = oldestCharge[0].oldestCharge;
      subtractAmount = Math.min(oldestCharge[0].oldestCharge, amount);
      newCharge -= subtractAmount;
      amount -= subtractAmount;
      await executeQuery(`UPDATE paymentsLedger SET paidAmount=${newCharge} WHERE id=${oldestCharge[0].id}`);
  }
}

transactionsRouter.post("/create-payment", async (req, res) => {
  try {
      const tenantID = req.body.tenantID;
      const description = req.body.description;
      const amount = req.body.amount;
      const currentDate = getDate();
      
      const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
      const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
      const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`)

      let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
      let temp = balance;
      balance = Number(amount) + balance;
      const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [charge, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance, amount];
      await executeQuery(query, values);
      updatePayment(-temp);
      res.send(currentDate);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

transactionsRouter.post('/delete-charge', async (req, res) => {
try {
  const paymentID = req.query['payment-id'];
  const query = `DELETE FROM paymentsLedger where id = ${paymentID};`;
  await executeQuery(query);
  res.sendStatus(200);
} catch (error) {
  res.status(500).json({ error: error.message });
}
});

// const intervalMinutes = 0.25;
// const interval = intervalMinutes * 60000;

// const timerID = setInterval(fillRentPayments, interval);

// async function fillRentPayments(){
//     const tenantPayments = await executeQuery(`SELECT * FROM tenants where rents IS NOT NULL`);
//     for (const payment of tenantPayments) {
//         const { rents, type, tenantID } = payment;
//         const date = getDate();

//         const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${uuidToString(tenantID)}`);
//         const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${uuidToString(tenantID)}`);
//         const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${uuidToString(tenantID)}`);

//         let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
//         balance =  balance - payment;

//         updatePayment(payment);
        
//         const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)";
//         const values = ['Rent', "Rent payment", date, rents, tenantID, balance];
//         await executeQuery(query, values);
//     }
// }

// NOTE: late fees logic
// const interval = 10000;
// setInterval(crawlForLatePayments, interval);

// function getAbbrDate() {
//   const date = new Date();
//   return date.toISOString().split('T')[0];
// }

// async function crawlForLatePayments() {
//   var tenantsWithLatePayments = await selectQuery(`SELECT id, tenantID, description, date FROM paymentsLedger WHERE type = 'Charge' AND idLate is NULL AND paidAmount > 0 AND DATEDIFF('${getAbbrDate()}', date) > -50`); // TODO: change to < 11
//   console.log(tenantsWithLatePayments);

//   for (let tenantWithLateCharges of tenantsWithLatePayments) {

//     const chargeBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     const paymentBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${uuidToString(tenantWithLateCharges.tenantID)}`);
//     let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0);
//     balance = 10 + balance;
    
//     const date = tenantWithLateCharges.date
//     const parts = date.toISOString().split('T');
//     const datePart = parts[0];
//     const dateFinal = `${datePart.split('-')[1]}/${datePart.split('-')[2]}/${datePart.split('-')[0]}`;

//     const query = "INSERT INTO paymentsLedger (type, description, date, amount, tenantID, idLate, balance, paidAmount) VALUES (?,?,?,?,?,?,?,?);";
//     const values = ['Charge', `Late: ${tenantWithLateCharges.description}, ${dateFinal}`, getDatePayment(), 10, tenantWithLateCharges.tenantID, tenantWithLateCharges.id, balance, 10];
//     await insertQuery(query, values);

//   }
// }

module.exports = transactionsRouter;