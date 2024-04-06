const express = require('express');
const managerRouter = express.Router();
const { selectQuery } = require('./db');

managerRouter.use(express.json());

managerRouter.get('/get-attributes', async (req, res) => {
    try {
        const managerID = '0x' + req.query['manager-id'];
        const query = `SELECT email, firstName, lastName FROM managers where managerID = ${managerID};`;
        const results = await selectQuery(query);
        res.send({
            firstName: results[0].firstName,
            lastName: results[0].lastName,
            email: results[0].email
        });
    } catch (error) {
        res.status(500).json({ error: 'No managerID found' });
    }
});

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

module.exports = managerRouter;