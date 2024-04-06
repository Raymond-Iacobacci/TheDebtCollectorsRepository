const express = require('express');
const tenantRouter = express.Router();
const { selectQuery } = require('./db');

tenantRouter.use(express.json());

tenantRouter.get('/get-attributes', async (req, res) => {
    try {
        const tenantID = '0x' + req.query['tenant-id'];
        const query = `SELECT email, firstName, lastName FROM managers where tenantID = ${tenantID};`;
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

module.exports = tenantRouter;