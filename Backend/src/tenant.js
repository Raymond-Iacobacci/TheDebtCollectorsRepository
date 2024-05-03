const express = require('express');
const { selectQuery, insertQuery } = require('./db');
const tenantRouter = express.Router();

tenantRouter.use(express.json());

tenantRouter.get('/get-payments', async(req, res) =>{
    try {
        tenantID = req.query['tenant-id'];
    
        paymentsDue = await selectQuery(`SELECT paymentsID, timeAssigned, amount, type, late FROM paymentsDue WHERE tenantID=${'0x' + tenantID}`);
        const result = [];
        paymentsDue.forEach(async function(payment){
            const moment = require('moment-timezone');
            const currTime = moment().tz('America/Los_Angeles');

            const currMonth = currTime.month()+1;
            const currDay = currTime.date();

            const date = new Date(moment()); // Create a Date object from the string

            // Get the month, day, and year from the Date object
            const _month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because getMonth() returns a zero-based index
            const _day = String(date.getDate()).padStart(2, '0');
            const _year = date.getFullYear();
            const formattedDate = `${_year}-${_month}-${_day}`;
            if (payment.time > formattedDate){
                // payment.time = `${month}-${day}-${year}`
                payment.late = "NOT LATE"
                result.push(payment);
            } else{
                payment.late = "LATE"
                result.push(payment)
            }
            // if(currMonth == month){
            //     if(currDay <= day){
            //         payment.time = `${month}-${day}-${year}`
            //         result.push(payment);
            //     } else if (formattedDate.diff(currTime, 'days', true) > 5 && payment.late === "NOT LATE") {
            //         payment.time  = `${month}-${day}-${year}`;
            //         payment.late = "LATE";
            //         result.push(payment);
            //         await selectQuery(`UPDATE paymentsDue SET late='LATE' WHERE paymentsID=${payment.paymentsID}`);
            //         const query = "INSERT INTO paymentsDue (type, time, amount, tenantID) VALUES (?, ?, ?, ?)";
            //         const values = [`Late Fee: ${payment.type}`, currTime.format('MM-DD-YYYY'), 50, Buffer.from(tenantID,'hex')];
            //         const returnVal = await insertQuery(query, values);

            //     } else {
            //         result.push(payment);
            //     }
            // }

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