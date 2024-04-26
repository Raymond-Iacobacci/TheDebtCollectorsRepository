const express = require('express');
const managerRouter = express.Router();
const { selectQuery, insertQuery, uuidToString } = require('./db');
const { sendMessage } = require('./sendMessage')

managerRouter.use(express.json());

const intervalMinutes = 1;
const interval = intervalMinutes * 60000;
const i = 10000
const timerID = setInterval(fillRentPayments, interval);

// async function fillRentPayments(){  
//     const tenantPayments = await selectQuery(`SELECT * FROM tenants where rents IS NOT NULL`);
//     for (const payment of tenantPayments) {
//         const { rents, type, tenantID } = payment;
//         const time = getDate();
//         await insertQuery("INSERT INTO paymentsDue (time, amount, type, tenantID) VALUES (?, ?, ?, ?)", [time, rents, 'Rent', tenantID]);
//     }
//     console.log(tenantPayments);
// }
// *** TODO: THIS CODE IS IRRELEVANT *** //
managerRouter.get('/get-tenant-payments', async(req, res) => {
    try{
        const managerID = '0x' + req.query['manager-id'];
        const tenantsQuery = await selectQuery(`SELECT firstName, lastName, address, amount, type, p.tenantID, time FROM paymentsDue p INNER JOIN tenants t ON p.tenantID = t.tenantID WHERE t.managerID =${managerID};`);
        for(let tenant of tenantsQuery){
            tenant.tenantID = tenant.tenantID.toString('hex').toUpperCase();
        }
        res.send(tenantsQuery);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});
function getDate(){
    const moment = require('moment-timezone');
    return moment().tz('America/Los_Angeles').format();
}
function getDatePayment(dateString) {
    const moment = require('moment-timezone');
    const parts = dateString.split('-');
    let formattedDate = parts[2] + '-' + parths[0].padStart(2, '0') + '-' + parts[1].padStart(2, '0');
    return moment(formattedDate).tf('America/Los_Angeles').format("MM-DD-YYYY"); // TODO: ISSUE
}


managerRouter.post('/create-tenant', async(req,res) => {
    try{
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const address = req.body.address;
        const monthlyRent = req.body.monthlyRent;
        const monthlyUtilites = req.body.monthlyUtilities;
        const managerId = req.query['manager-id'];
        const managerResult = await selectQuery(`SELECT firstName,lastName FROM managers where managerID = ${'0x' + managerId};`);

        const currentDate = getDate();
        //const timestamp = currentDate.getTime();

        const query = "INSERT INTO tenants (firstName, lastName, email, address, managerID, rents, utilities) VALUES (?, ?, ?, ?, ?, ?, ?);";
        const values = [firstName, lastName, email, address, Buffer.from(managerId,'hex'), monthlyRent, monthlyUtilites];
        await insertQuery(query, values);

        const phoneNumber = '+16502962105';
        const message = `Hello ${firstName} ${lastName} welcome to the DebtCollectors.`;
    
        sendMessage(phoneNumber, message)
            .then(() => {
                res.json({ message: 'SMS sent successfully' });
            })
            .catch(err => {
                res.status(500).json({ message: err });
            });

    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

managerRouter.post('/create-payment', async(req, res) =>{
    try{
        const email = req.body.email;
        const type = req.body.type;
        const amount = req.body.amount;
        const currentDate = getDatePayment(req.body.time);
        const tenantID = await selectQuery(`SELECT tenantID from tenants where email='${email}'`);
        const query = "INSERT INTO paymentsDue (type, time, amount, tenantID) VALUES (?, ?, ?, ?)";
        const values = [type, currentDate, amount, tenantID[0].tenantID ];
        await insertQuery(query, values);

        const phoneNumber = '+16502962105';
        const message = `Hello you have $${amount} due by ${currentDate}`;
        
        sendMessage(phoneNumber, message)
        .then(() => {
            res.json({ message: 'SMS sent successfully' });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
    }catch(error){
        res.status(500).json({error: error.message});
    }
});

managerRouter.get('/get-tenants', async(req,res) => {
    try{
        const managerID = req.query['manager-id'];
        const tenantsList = await selectQuery(`SELECT firstName, lastName, email, address from tenants where managerID = ${'0x' + managerID}`);
        const formattedData = tenantsList.map(row => ({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            address: row.address
          }));
        res.send(formattedData);  
    }catch(error){
        res.status(500).json({error: error.message});
    }
   
});


module.exports = managerRouter;