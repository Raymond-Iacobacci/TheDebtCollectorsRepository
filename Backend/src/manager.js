const express = require('express');
const managerRouter = express.Router();
const { selectQuery, insertQuery, uuidToString } = require('./db');
const sendEmail = require('./sendEmail');

managerRouter.use(express.json());

managerRouter.get('/get-pending-tenants', async (req, res) => {
    try {
        const managerID = '0x' + req.query['manager-id'];
        const managerResults = await selectQuery(`SELECT managerEmail from managers where managerID = ${managerID};`);
        const pendingTenants = [];

        if (!managerResults) {
            res.send('managerID not found').end();
            return;
        }

        const manager = managerResults[0];
        const managerEmail = manager.email;

        const pendingTenantsObjects = await selectQuery(`SELECT tenantEmail, firstName, lastName from pendingTenants where managerEmail = ${managerEmail};`);

        if (!pendingTenantsObjects) {
            res.send('No pending tenants found').end();
            return;
        }

        for(const pendingTenant of pendingTenantsObjects){
            pendingTenants.push({
                tenantEmail: pendingTenant.tenantEmail,
                firstName: pendingTenant.firstName,
                lastName: pendingTenant.lastName
              });
        }
        res.send(pendingTenants);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

 // 
    // For rent: UPDATE TABLE paymentsDue ROW (dueDate, tenantID, type = 'rent')
    // If the time is after the due date return a warning to the frontend
function getDate(){
    const moment = require('moment-timezone');
    return moment().tz('America/Los_Angeles').format();
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
        // //const managerEmail = null;

        // /**
        //  * Send email notifying tenant of account creation.
        //  */
        const emailText = "You have been added as a new tenant to property " + address + " by " + managerResult[0].firstName + " " + managerResult[0].lastName;
        const emailResults = sendEmail(email, "New Tenant", emailText, (error) =>{
            if(error){
                throw new Error(error);
            }
        });
        console.log('timestamp', currentDate);
        const query = "INSERT INTO tenants (firstName, lastName, email, address, managerID, rents, utilities) VALUES (?, ?, ?, ?, ?, ?, ?);";
        const values = [firstName, lastName, email, address, Buffer.from(managerId,'hex'), monthlyRent, monthlyUtilites];
        await insertQuery(query, values);

        const tenantIDObject = await selectQuery(`SELECT tenantID FROM tenants where email='${email}'`);
        const queryRentDue = "INSERT INTO paymentsDue (type, time, amount, tenantID) VALUES (?, ?, ?, ?)";
        const valuesRentDue = ['Rent', currentDate, monthlyRent, tenantIDObject[0].tenantID ];
        await insertQuery(queryRentDue, valuesRentDue);

        res.send(emailResults);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

managerRouter.post('/create-payment', async(req, res) =>{
    try{
        const tenantID = req.body.tenantID;
        const type = req.body.type;
        const amount = req.body.amount;
        const currentDate = getDate();
        console.log(currentDate);
        const query = "INSERT INTO paymentsDue (type, time, amount, tenantID) VALUES (?, ?, ?, ?)";
        const values = [type, currentDate, amount, Buffer.from(tenantID, 'hex') ];
        await insertQuery(query, values);
        res.send(values);
    }catch(error){
        res.status(500).json({error: error.message});
    }


});

//Tenants that have paid and not paid. 
// SELECT tenantID, due_date FROM paymentsDue;
// SELECT tenantID, date_payment from paymentsMade;
// for tenant in tenantID: if currentTime < dueDate (if due_date - 4 < date_payment < due_date: return paid ; else return notPaid;)




// Check Payments:
// SELECT tenantID, due_date, date_payment from payments; --> rows
// for row in rows: if date_payment == NULL and due_date > currentDate > due_date - 4: return warning and not paid; if date_payment == NULL and currentDate > due_date; return late and not paid; if date_payment != NULL: return paid;

// Handle Payment:
// SELECT tenantID, due_date, date_payment from payments; --> rows
// if paymentType == 'rent': rows.due_date += 1 month, rows.date_payment = currentDate, return paid; else: rows.date_payment = currentDate, return paid;

// SELECT tenantID, due_date, date_payment from payments WHERE date_payment is not NULL;



module.exports = managerRouter;