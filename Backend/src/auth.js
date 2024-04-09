const express = require('express');
const session = require('express-session');
const {selectQuery} = require('./db');
require('dotenv').config({ path: '../.env' });

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

authRouter.get('/verify-tenant', async (req, res) => {
  const email = req.query['email'];
  try {
    const tenant = await selectQuery(`SELECT tenantID FROM tenants WHERE email = '${email}';`);

    if (!tenant || tenant.length === 0) {
      res.status(404).send({err : 'Tenant not found'});
      return;
    }

    res.send({uuid : tenant[0].tenantID.toString('hex').toUpperCase()});
  } catch (error) {
    console.error('Error verifying tenant:', error);
    res.status(500).send('Internal server error');
  }
});

authRouter.get('/verify-manager', async (req, res) => {
  const email = req.query['email'];
  try {
    const manager = await selectQuery(`SELECT managerID FROM managers WHERE email = '${email}';`);

    if (!manager || manager.length === 0) {
      res.status(404).send({err : 'Manager not found'});
      return;
    }

    res.send({uuid : manager[0].managerID.toString('hex').toUpperCase()});
  } catch (error) {
    console.error('Error verifying Manager:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = authRouter;