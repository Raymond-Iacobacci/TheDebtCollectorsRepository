const express = require('express');
const managerRouter = express.Router();
const { selectQuery, insertQuery } = require('./db');
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

managerRouter.post('/create-tenant', async(req,res) => {
    try{
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const address = req.body.address;
        const managerId = req.query['manager-id'];
        const managerResult = await selectQuery(`SELECT firstName,lastName FROM managers where managerID = ${'0x' + managerId};`);

        // //const managerEmail = null;

        // /**
        //  * Send email notifying tenant of account creation.
        //  */
        const emailText = "You have been added as a new tenant to property " + address + " by " + managerResult[0].firstName + " " + managerResult[0].lastName;
        const emailResults = sendEmail(email, "New Tenant", emailText, (error) =>{
            if(error){
                console.log('before');
                throw new Error(error);
            }
            console.log('after');
        });

        const query = "INSERT INTO tenants (firstName, lastName, email, address, managerID) VALUES (?, ?, ?, ?, ?);";
        const values = [firstName, lastName, email, address, Buffer.from(managerId,'hex')];
        await insertQuery(query, values);
        res.send(emailResults);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
});

module.exports = managerRouter;