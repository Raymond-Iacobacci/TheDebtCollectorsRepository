const express = require('express');
const { selectQuery, insertQuery, executeQuery } = require('./db');
const tenantRouter = express.Router();

tenantRouter.use(express.json());

tenantRouter.get('/get-payments', async(req, res) =>{
    try {
        tenantID = req.query['tenant-id'];
    
        paymentsDue = await selectQuery(`SELECT paymentsID, time, amount, type FROM paymentsDue WHERE tenantID=${'0x' + tenantID}`);
        console.log(paymentsDue);
        const result = [];
        paymentsDue.forEach(function(payment){
            const moment = require('moment-timezone');
            // console.log(moment().tz('America/Los_Angeles').format());

            const currTime = moment().tz('America/Los_Angeles');

            const currMonth = currTime.month()+1;
            const currDay = currTime.date();

            const month = Number(payment.time.split("T")[0].split("-")[1]);
            const day = Number(payment.time.split("T")[0].split("-")[2]);
            console.log(month);
            console.log(day);
            if(currMonth == month){
                if(currDay <= day){
                    result.push(payment);
                }
            }

        });
        res.send(result);
    // Thing that get's the current time
    // select time from paymentsDue where tenantID == current_tenantID;
    // IF time > JavaScript.currentTime - 4 days for ANY i in MySQL.time.array, return notification
    // IF time > JavaScript.currentTime  for ANY i in MySQL.time.array, return alert
    
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
        console.log(type);
        if(type === 'Rent'){
            const dateDue = await selectQuery(`SELECT time FROM paymentsDue where paymentsID=${paymentsID}`);
            const date = moment(dateDue[0].time);
            const newDate = date.add(1,'months');
            console.log(newDate.format());
            await executeQuery(`UPDATE paymentsDue SET time = ? WHERE paymentsID = ?`, [newDate.format(), paymentsID]);
            const query = "INSERT INTO paymentsMade (paymentsID, type, amount, tenantID, time) VALUES (?, ?, ?, ?, ?)";
            const values = [paymentsID, type, amount, Buffer.from(tenantID, 'hex'), currTime];
            await insertQuery(query, values);
        }else{
            
            await selectQuery(`DELETE FROM paymentsDue where paymentsID=${paymentsID}`);
            const query = "INSERT INTO paymentsMade (paymentsID, type, amount, tenantID, time) VALUES (?, ?, ?, ?, ?)";
            const values = [paymentsID, type, amount, Buffer.from(tenantID, 'hex'), currTime];
            await insertQuery(query, values);
        }
        res.send(currTime);
    }catch(error){
        res.status(500).json({ error: error.message });
    
    }
});

module.exports = tenantRouter;