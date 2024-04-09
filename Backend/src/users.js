const express = require('express');
const {selectQuery} = require('./db');

const usersRouter = express.Router();

usersRouter.use(express.json());
usersRouter.use(express.urlencoded({ extended: true }));

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

usersRouter.get('/verify-tenant', async (req, res) => {
  const email = req.query['email'];
  await verifyUser('tenants', 'tenantID', email, res);
});

usersRouter.get('/verify-manager', async (req, res) => {
  const email = req.query['email'];
  await verifyUser('managers', 'managerID', email, res);
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

module.exports = usersRouter;