const express = require('express');
const dashboardRouter = express.Router();
const { executeQuery } = require('../utils');

dashboardRouter.use(express.json());

const charge = 'Charge';
const payment = 'Payment';
const credit = 'Credit';

/* 
  Description: Given a manager-id, return the number of tenants under the manager
  input: manager-id (binary(16))
  output: the number of tenants under the manager (int)
*/
dashboardRouter.get('/get-number-of-tenants', async (req, res) => {
  try{
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT COUNT(*) AS numberOfTenants FROM tenants WHERE managerID = ${managerID};`;
    const results = await executeQuery(query);
    res.send(results[0]);
  } catch (error) {
    res.status(500).json({ error: `error getting number of tenants with error: ${error}` });
  }
});

/* 
  Description: Given a manager-id, return the number of unresolved requests
  input: manager-id (binary(16))
  output: the number of unresolved requests (int)
*/
dashboardRouter.get('/get-number-of-unresolved-requests', async (req, res) => {
  try{
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT COUNT(*) AS count FROM requests WHERE managerID=${managerID} AND (status='Unresolved' OR status='Ongoing');`;
    const results = await executeQuery(query);
    res.send(results[0])
  } catch (error) {
    res.status(500).json({ error: 'Error getting number of unresolved requests with error: ${error}' });
  }
});

/* 
  Description: Given a manager-id, return the number of rent payments paid this month
  input: manager-id (binary(16))
  output: number of rent payments (int)
*/
dashboardRouter.get('/get-number-of-rent-payments', async (req, res) => {
  try{
    const managerID = '0x' + req.query['manager-id'];
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const formattedStartDate = startDate.toISOString().slice(0, 10);
    const formattedEndDate = currentDate.toISOString().slice(0, 10);

    const query = `SELECT COUNT(*) AS count
    FROM (
      SELECT type, description, amount, date, paidAmount
      FROM paymentsLedger p
      INNER JOIN (
        SELECT tenantID
        FROM tenants
        WHERE managerID = ${managerID}
      ) AS t ON t.tenantID = p.tenantID
    ) AS final
    WHERE final.type = 'Charge' AND final.paidAmount=0 AND final.description = 'Rent' AND final.date>= '${formattedStartDate}' AND final.date<= '${formattedEndDate}'`;

    const results = await executeQuery(query);
    res.send(results[0]);
  } catch (error) {
    res.status(500).json({ error: `error getting number of rent payments with error: ${error}` });
  }
});

/* 
  Description: Given a manager-id, return the total balance of all tenants
  input: manager-id (binary(16))
  output: the totatl balance of all the tenants (float)
*/
dashboardRouter.get("/get-total-balance", async (req, res) => {
  try {
    const managerID = req.query["manager-id"];
    const chargeBalance = await executeQuery(`select sum(amount) as amount FROM paymentsLedger p1 INNER JOIN tenants t ON t.tenantID=p1.tenantID where managerID=${'0x' + managerID} and type='${charge}'`);
    const paymentBalance = await executeQuery(`select sum(amount) as amount FROM paymentsLedger p1 INNER JOIN tenants t ON t.tenantID=p1.tenantID where managerID=${'0x' + managerID} and type='${payment}'`);
    const creditBalance=await executeQuery(`select sum(amount) as amount FROM paymentsLedger p1 INNER JOIN tenants t ON t.tenantID=p1.tenantID where managerID=${'0x' + managerID} and type='${credit}'`);

    let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
    res.send({balance});

  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

/* 
  Description: Given a manager-id, return a list of the tenants with the top 5 most outstanding balances
  input: manager-id (binary(16))
  output: an array of 5 (or less) tenants with their outstanding balances
*/
dashboardRouter.get("/get-outstanding-balances-per-tenant", async (req, res) => {
  try {
    const managerID = req.query["manager-id"];
    const tenantsList = await executeQuery(
      `SELECT tenantID, firstName, lastName from tenants where managerID = ${"0x" + managerID}`
    );
    const formattedData = tenantsList.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      tenantID: row.tenantID.toString('hex').toUpperCase(),
    }));
    const balances = [];
    for (const tenant of formattedData) {         
      const tenantID = tenant.tenantID;
      const lastName = tenant.lastName;
      const firstName = tenant.firstName;
      const chargeBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${charge}' AND tenantID=${'0x' + tenantID}`);
      const paymentBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${payment}' AND tenantID=${'0x' + tenantID}`);
      const creditBalance = await executeQuery(`SELECT sum(amount) as amount from paymentsLedger where type='${credit}' AND tenantID=${'0x' + tenantID}`)

      let balance = Number(chargeBalance[0].amount || 0)-Number(paymentBalance[0].amount || 0) - Number(creditBalance[0].amount || 0);
      if (balance > 0) {
        balances.push({
          firstName,
          lastName,
          tenantID,
          balance,
        });
      }
    }
    const topBalances = balances.sort((a, b) => b.balance - a.balance).slice(0, 5);
    res.send(topBalances);
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});

module.exports = dashboardRouter;