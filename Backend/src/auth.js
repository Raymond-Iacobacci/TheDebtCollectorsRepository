const express = require('express');
const {selectQuery} = require('./db');

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

async function verifyUser(tableName, userID, email, res) {
  try {
    const user = await selectQuery(`SELECT ${userID} FROM ${tableName} WHERE email = '${email}';`);

    if (!user || user.length === 0) {
      res.status(404).send({ err: "User not found." });
      return;
    }

    res.send({ uuid: user[0][userID].toString('hex').toUpperCase() });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

authRouter.get('/verify-tenant', async (req, res) => {
  const email = req.query['email'];
  await verifyUser('tenants', 'tenantID', email, res);
});

authRouter.get('/verify-manager', async (req, res) => {
  const email = req.query['email'];
  await verifyUser('managers', 'managerID', email, res);
});

module.exports = authRouter;