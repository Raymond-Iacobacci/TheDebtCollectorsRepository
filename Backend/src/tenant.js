const express = require('express');
const { selectQuery, insertQuery, executeQuery } = require('./db');
const tenantRouter = express.Router();

tenantRouter.use(express.json());

tenantRouter.get('/get-payments', async(req, res) =>{
    try {
        tenantID = req.query['tenant-id'];
    
        paymentsDue = await selectQuery(`SELECT paymentsID, time, amount, type FROM paymentsDue WHERE tenantID=${'0x' + tenantID}`);
        const result = [];
        paymentsDue.forEach(function(payment){
            const moment = require('moment-timezone');
            // console.log(moment().tz('America/Los_Angeles').format());

            const currTime = moment().tz('America/Los_Angeles');

            const currMonth = currTime.month()+1;
            const currDay = currTime.date();

            const month = Number(payment.time.split("T")[0].split("-")[1]);
            const day = Number(payment.time.split("T")[0].split("-")[2]);
            if(currMonth == month){
                if(currDay <= day){
                    result.push(payment);
                }
            }

        });
        res.send(result);

    } catch (error) {
        res.status(500).json({ error: error });
    }
});
tenantRouter.post('/make-payment', async(req, res)=>{
    try{
        const tenantID = req.query['tenant-id'];
        const paymentsID = req.body.paymentsID;
        const type = req.body.type;
        const amount = req.body.amount;
        const moment = require('moment-timezone');
        const currTime = moment().tz('America/Los_Angeles').format();
  
  
        await selectQuery(`DELETE FROM paymentsDue where paymentsID=${paymentsID}`);
        const query = "INSERT INTO paymentsMade (paymentsID, type, amount, tenantID, time) VALUES (?, ?, ?, ?, ?)";
        const values = [paymentsID, type, amount, Buffer.from(tenantID, 'hex'), currTime];
        await insertQuery(query, values);
        
        res.send(currTime);
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