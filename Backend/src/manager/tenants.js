const express = require('express');
const tenantsRouter = express.Router();
const { executeQuery, uuidToString } = require('../utils');

tenantsRouter.use(express.json());

/* 
  Description: Inserts a tenant into the database and sends an email confirmation
  input: firstName, lastName, email, address, rent, manager-id
  output: status code 
*/
tenantsRouter.post("/create-tenant", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const address = req.body.address;
    const monthlyRent = req.body.monthlyRent;
    const monthlyUtilites = req.body.monthlyUtilities;
    const managerID = req.query["manager-id"];
    const managerResult = await executeQuery(`SELECT firstName,lastName FROM managers where managerID = ${"0x" + managerID};`);
    const query = "INSERT INTO tenants (firstName, lastName, email, address, managerID, rents, utilities) VALUES (?, ?, ?, ?, ?, ?, ?);";
    const values = [
      firstName,
      lastName,
      email,
      address,
      Buffer.from(managerID, "hex"),
      monthlyRent,
      monthlyUtilites,
    ];
    await executeQuery(query, values);

    const message = `Hello ${firstName} ${lastName}, you have been added as a tenant to TheDebtCollectors
    Property Management Suite. You can login here: https://frontend-kxfzqfz2rq-uc.a.run.app`;

    sendEmail(email, 'Welcome to TheDebtCollectors Property Management Suite', message)
      .then(data => {
        res.send(200);
      })
      .catch(error => {
        res.send('Error sending email:');
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* 
  Description: Given a manager-id, return all the tenants under the manager
  input: manager-id
  output: array of json objects (firstName, lastName, email, address, tenantID)
*/
tenantsRouter.get("/get-tenants", async (req, res) => {
  try {
    const managerID = req.query["manager-id"];
    const tenantsList = await executeQuery(
      `SELECT firstName, lastName, email, address, tenantID from tenants where managerID = ${"0x" + managerID
      }`
    );
    const formattedData = tenantsList.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      address: row.address,
      tenantID: row.tenantID.toString('hex').toUpperCase(),
    }));
    res.send(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

tenantsRouter.post("/delete-tenant", async (req, res) => {
  try {
    const tenantID = '0x' + req.query["tenant-id"];
    const requests = await executeQuery(`SELECT requestID from requests where tenantID = ${tenantID};`);
    if(requests){
      for(let request of requests){
        const requestID = uuidToString(request.requestID);
        await executeQuery(`DELETE FROM attachments where requestID = ${requestID}`);
        await executeQuery(`DELETE FROM comments where requestID = ${requestID}`);
        await executeQuery(`DELETE FROM requests where requestID = ${requestID}`);
        const expenseResults = await executeQuery(`SELECT expenseID from expenses where requestID = ${requestID};`);
        for(const expenseID of expenseResults){
          await executeQuery(`UPDATE expenses SET requestID = NULL where expenseID = ${expenseID.expenseID}`);
        }
      }
    }
    await executeQuery(`DELETE FROM paymentsLedger where tenantID = ${tenantID};`);
    await executeQuery(`DELETE FROM tenants where tenantID = ${tenantID};`);
    res.send(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = tenantsRouter;