const express = require('express');
const {executeQuery, getUserType} = require('../utils');

const cookiesRouter = express.Router();

cookiesRouter.use(express.json());
cookiesRouter.use(express.urlencoded({ extended: true }));

async function verifyUser(tableName, userID, email, token, res) {
  try {
    const user = await executeQuery(`SELECT ${userID} FROM ${tableName} WHERE email = '${email}';`);
    await executeQuery(`UPDATE ${tableName} SET token = '${token}' WHERE email = '${email}';`);
    res.send({ uuid: user[0][userID].toString('hex').toUpperCase() });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

cookiesRouter.put('/login-tenant', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await verifyUser('tenants', 'tenantID', email, token, res);
});

cookiesRouter.put('/login-manager', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await verifyUser('managers', 'managerID', email, token, res);
});

cookiesRouter.get('/verify-cookie', async (req, res) => {
  const userID = '0x' + req.query['user-id'];
  const frontendToken = req.query['token'];

  const userType = await getUserType(userID);
  queryResults = await executeQuery(`SELECT token FROM ${userType}s WHERE ${userType}ID = ${userID};`);
  const backendToken = queryResults[0].token;

  if (frontendToken === backendToken) {
    res.sendStatus(200);
  } else {
    res.status(404).send({ err: "Token not verified." });
  }
});

cookiesRouter.put('/remove-cookie', async (req, res) => {
  const userID = '0x' + req.query['user-id'];
  const userType = await getUserType(userID);
  await executeQuery(`UPDATE ${userType}s SET token = NULL WHERE ${userType}ID = ${userID};`);
  res.sendStatus(200);
});

module.exports = cookiesRouter;