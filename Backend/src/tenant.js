const express = require('express');
const { selectQuery, insertQuery } = require('./db');
const tenantRouter = express.Router();
const charge = "Charge"
const payment = "Payment"
tenantRouter.use(express.json());

tenantRouter.get('/get-ledger', async(req, res) =>{
    try {
        tenantID = req.query['tenant-id'];
    
        ledger = await selectQuery(`SELECT type, time, amount, description, balance FROM paymentsLedger WHERE tenantID=${'0x' + tenantID}`);
        
        res.send(ledger);

    } catch (error) {
        res.status(500).json({ error: error });
    }
});
function getDatePayment() {
    const moment = require("moment-timezone");
    return moment().tz("America/Los_Angeles").format("YYYY-MM-DD");
}
tenantRouter.post('/make-payment', async(req, res)=>{
    try{
        const tenantID = req.query['tenant-id'];
        const description = req.body.description;
        const amount = req.body.amount;
        const currentDate = getDatePayment();

        const chargeBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
        const paymentBalance = await selectQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
        // console.log(`This is the amount: ${amount}`);
        // console.log(chargeBalance[0].amount-paymentBalance[0].amount)
        let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0);
         balance =  balance - Number(amount);
        const query = "INSERT INTO paymentsLedger (type, description, time, amount, tenantID, balance) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [payment, description, currentDate, amount, Buffer.from(tenantID, 'hex'), balance];
        await insertQuery(query, values);
        
        res.send(currentDate);
    }catch(error){
        res.status(500).json({ error: error.message });
    
    }
});
tenantRouter.get('/get-payment-history', async(req, res) => {
    try{
        tenantID = req.query['tenant-id'];
        tenantsPayment = await selectQuery(`SELECT type, time, amount FROM paymentsMade where tenantID=${'0x' +tenantID}`);
        res.send(tenantsPayment);
    }catch(error){
        res.status(500).json({error:error.message});
    }


});
module.exports = tenantRouter;