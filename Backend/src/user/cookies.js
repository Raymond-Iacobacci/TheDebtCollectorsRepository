const express = require('express');
const {executeQuery} = require('../utils');

const cookiesRouter = express.Router();

cookiesRouter.use(express.json());
cookiesRouter.use(express.urlencoded({ extended: true }));

async function getUserType(userID) {
  const tenantResults = await executeQuery(`SELECT tenantID FROM tenants WHERE tenantID = ${userID};`);
  if (tenantResults.length > 0) {
      return 'tenant';
  }
  const managerResults = await executeQuery(`SELECT managerID FROM managers WHERE managerID = ${userID};`);
  if (managerResults.length > 0) {
      return 'manager';
  }
  return null; 
}

async function verifyUser(tableName, userID, email, token, res) {
  try {
    const user = await executeQuery(`SELECT ${userID} FROM ${tableName} WHERE email = '${email}';`);
    if (!user || user.length === 0) {
      res.status(404).send({ err: "User not found." });
      return;
    }
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

cookiesRouter.get('/get-attributes', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  const userType = await getUserType(userID);
  if(userType === null){
    res.status(404).send({ err: "User not found." });
    return;
  }
  const user = await executeQuery(`SELECT firstName, lastName, email FROM ${userType}s WHERE ${userType}ID = ${userID};`);
  res.send(user[0]);
});

cookiesRouter.get('/verify-token', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  const frontendToken = req.query['token'];

  const userType = await getUserType(userID);
  if(userType === null){
    res.status(404).send({ err: "User not found." });
    return;
  }

  queryResults = await executeQuery(`SELECT token FROM ${userType}s WHERE ${userType}ID = ${userID};`);
  const backendToken = queryResults[0].token;

  if (frontendToken === backendToken) {
    res.sendStatus(200);
  } else {
    res.status(404).send({ err: "Token not verified." });
  }
});

cookiesRouter.put('/remove-token', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  const userType = await getUserType(userID);

  if(userType === null){
    res.status(404).send({ err: "User not found." });
    return;
  }

  await executeQuery(`UPDATE ${userType}s SET token = NULL WHERE ${userType}ID = ${userID};`);
  res.sendStatus(200);
});

module.exports = cookiesRouter;