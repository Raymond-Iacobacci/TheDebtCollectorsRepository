const express = require('express');
const homeRouter = express.Router();
const { insertQuery } = require('./db');

homeRouter.use(express.json());

homeRouter.post('/create-account', async (req, res) => {
    try{
      const tenantEmail = req.body.tenantEmail;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const managerEmail = req.body.managerEmail;

      const query = 'INSERT INTO pendingTenants (tenantEmail, firstName, lastName, managerEmail) VALUES (?, ?, ?, ?)';
      const values = [tenantEmail, firstName, lastName, managerEmail];
      const results = await insertQuery(query, values);
      res.send(results);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting into pendingTenants table' });
    }
  });

  module.exports = homeRouter;