const express = require('express');
const {selectQuery} = require('./db');

const usersRouter = express.Router();

usersRouter.use(express.json());
usersRouter.use(express.urlencoded({ extended: true }));

async function verifyUser(tableName, userID, email, token, res) {
  try {
    const user = await selectQuery(`SELECT ${userID} FROM ${tableName} WHERE email = '${email}';`);

    if (!user || user.length === 0) {
      res.status(404).send({ err: "User not found." });
      return;
    }
    await selectQuery(`UPDATE ${tableName} SET token = '${token}' WHERE email = '${email}';`);
    res.send({ uuid: user[0][userID].toString('hex').toUpperCase() });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

usersRouter.put('/login-tenant', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await verifyUser('tenants', 'tenantID', email, token, res);
});6

usersRouter.put('/login-manager', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await verifyUser('managers', 'managerID', email, token, res);
});

usersRouter.get('/get-attributes', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  const userResults = await selectQuery(`SELECT firstName, lastName, email FROM tenants WHERE tenantID = ${userID};`);
  let user = userResults[0];
  if(!user){
    const userResults = await selectQuery(`SELECT firstName, lastName, email FROM managers WHERE managerID = ${userID};`);
    user = userResults[0];
    if(!user){
      res.status(404).send({ err: "User not found." });
      return;
    }
  }
  res.send({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  })
});

usersRouter.get('/verify-token', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  const frontendToken = req.query['token'];
  let backendToken;

  const tenantTokenResult = await selectQuery(`SELECT token FROM tenants WHERE tenantID = ${userID};`);
  if (tenantTokenResult.length > 0) {
    backendToken = tenantTokenResult[0].token;
  } else {
    const managerTokenResult = await selectQuery(`SELECT token FROM managers WHERE managerID = ${userID};`);
    if (managerTokenResult.length > 0) {
      backendToken = managerTokenResult[0].token;
    }
  }

  if (!backendToken) {
    res.status(404).send({ err: "User not found." });
    return;
  }

  if (frontendToken === backendToken) {
    res.sendStatus(200);
  } else {
    res.status(404).send({ err: "Token not verified." });
  }
});

usersRouter.put('/remove-token', async (req, res) => {
  const userID = '0x' + req.query['userID'];
  let backendToken;
  let userType;

  const tenantTokenResult = await selectQuery(`SELECT token FROM tenants WHERE tenantID = ${userID};`);
  if (tenantTokenResult.length > 0) {
    backendToken = tenantTokenResult[0].token;
    userType = 'tenant';
  } else {
    const managerTokenResult = await selectQuery(`SELECT token FROM managers WHERE managerID = ${userID};`);
    if (managerTokenResult.length > 0) {
      backendToken = managerTokenResult[0].token;
      userType = 'manager';
    }
  }

  if (!backendToken) {
    res.status(404).send({ err: "User not found." });
    return;
  }

  if (userType === 'tenant') {
    await selectQuery(`UPDATE tenants SET token = NULL WHERE tenantID = ${userID};`);
  } else if (userType === 'manager') {
    await selectQuery(`UPDATE managers SET token = NULL WHERE managerID = ${userID};`);
  }
  res.sendStatus(200);
});

module.exports = usersRouter;
