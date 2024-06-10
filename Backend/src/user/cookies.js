const express = require('express');
const {executeQuery, getUserType} = require('../utils');

const cookiesRouter = express.Router();

cookiesRouter.use(express.json());
cookiesRouter.use(express.urlencoded({ extended: true }));

/* Gets userID from database and updates the user's cookie */
async function addCookie(tableName, userID, email, token, res) {
  try {
    const user = await executeQuery(`SELECT ${userID} FROM ${tableName} WHERE email = '${email}';`);
    await executeQuery(`UPDATE ${tableName} SET token = '${token}' WHERE email = '${email}';`);
    res.send({ uuid: user[0][userID].toString('hex').toUpperCase() });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

/* logs the tenant by adding a cookie for user's session */
cookiesRouter.put('/login-tenant', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await addCookie('tenants', 'tenantID', email, token, res);
});

/* logs the manager by adding a cookie for user's session */
cookiesRouter.put('/login-manager', async (req, res) => {
  const email = req.query['email'];
  const token = req.body['token'];
  await addCookie('managers', 'managerID', email, token, res);
});

/* given a user and cookie, verify if the cookie is correct */
cookiesRouter.get('/verify-cookie', async (req, res) => {
  const userID = '0x' + req.query['user-id'];
  const frontendToken = req.query['token'];

  const userType = await getUserType(userID);
  if(userType === null){
    console.log('ENTERED HERE ')
    res.sendStatus(404).send({ err: "No user found" });
    return;
  }
  queryResults = await executeQuery(`SELECT token FROM ${userType}s WHERE ${userType}ID = ${userID};`);
  const backendToken = queryResults[0].token;

  if (frontendToken === backendToken) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404).send({ err: "Token not verified." });
  }
});

/* given a user, delete the cookie from the database */
cookiesRouter.put('/remove-cookie', async (req, res) => {
  const userID = '0x' + req.query['user-id'];
  const userType = await getUserType(userID);
  await executeQuery(`UPDATE ${userType}s SET token = NULL WHERE ${userType}ID = ${userID};`);
  res.sendStatus(200);
});

module.exports = cookiesRouter;