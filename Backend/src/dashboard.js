const express = require('express');
const dashBoardRouter = express.Router();
const { executeQuery } = require('./db');

dashBoardRouter.use(express.json());

dashBoardRouter.get('/get-number-of-tenants', async (req, res) => {
  try{
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT COUNT(*) AS numberOfTenants FROM tenants WHERE managerID = ${managerID};`;
    const results = await executeQuery(query);
    res.send(results[0]);
  } catch (error) {
    res.status(500).json({ error: `error getting number of tenants with error: ${error}` });
  }
});

dashBoardRouter.get('/get-number-of-unresolved-requests', async (req, res) => {
  try{
    const managerID = '0x' + req.query['manager-id'];
    const query = `select count(*) AS count from requests where managerID=${managerID} and status='Unresolved' OR status='Ongoing'`;
    const results = await executeQuery(query);
    res.send(results);
  } catch (error) {
    res.status(500).json({ error: 'Error getting number of unresolved requests with error: ${error}' });
  }
});

module.exports = dashBoardRouter;