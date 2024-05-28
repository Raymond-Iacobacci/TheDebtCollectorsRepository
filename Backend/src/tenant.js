const express = require('express');
const { executeQuery } = require('./utils');
const tenantRouter = express.Router();
const charge = "Charge"
const payment = "Payment"
const credit = "Credit"
tenantRouter.use(express.json());

tenantRouter.get('/get-ledger', async(req, res) =>{
    try {
        tenantID = req.query['tenant-id'];
    
        ledger = await executeQuery(`SELECT id, type, date, amount, description, balance FROM paymentsLedger WHERE tenantID=${'0x' + tenantID}`);
        
        res.send(ledger);

    } catch (error) {
        res.status(500).json({ error: error });
    }
});

function getDatePayment() {
    const moment = require("moment-timezone");
    return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}

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

tenantRouter.post('/make-payment', async(req, res)=>{
    try{
        const tenantID = req.query['tenant-id'];
        const description = req.body.description;
        let amount = req.body.amount;
        amount = Number(amount);
        const currentDate = getDatePayment();

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

tenantRouter.get('/get-payment-history', async(req, res) => {
    try{
        tenantID = req.query['tenant-id'];
        tenantsPayment = await executeQuery(`SELECT type, time, amount FROM paymentsMade where tenantID=${'0x' +tenantID}`);
        res.send(tenantsPayment);
    } catch(error){
        res.status(500).json({error:error.message});
    }
});

tenantRouter.get('/get-announcements', async (req, res) => {
    try {
      const tenantID = '0x' + req.query['tenant-id'];
      const query = `SELECT a.title, a.description, a.date FROM announcements a JOIN tenants t ON a.managerID = t.managerID WHERE t.tenantID = ${tenantID};`;
      const announcements = await executeQuery(query);
      res.send(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message});
    }
  });

module.exports = tenantRouter;