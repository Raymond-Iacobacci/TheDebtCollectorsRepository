const express = require('express');
const requestsRouter = express.Router();
const { executeQuery, uuidToString, getDate } = require('../utils');

requestsRouter.use(express.json())

/* 
  Description: Given a managerID, return all the requests from tenants under this managerID
  input: manager-id
  output: array of json objects (requests)
*/
requestsRouter.get('/get-view', async (req, res) => {
  try {
    const managerID = '0x' + req.query['manager-id'];
    const query = `SELECT r.requestID, CONCAT(t.firstname, ' ', t.lastname) AS name, t.address, r.type, r.status, r.date FROM requests 
    AS r JOIN tenants AS t ON r.tenantID = t.tenantID WHERE r.managerID = ${managerID} ORDER BY r.date;`;
    const requestResults = await executeQuery(query);

    if (!requestResults) {
      res.send('No requests for this managerID').end();
      return;
    }

    for(let request of requestResults){
      request.requestID = request.requestID.toString('hex').toUpperCase();
    }

    res.send(requestResults).end();
  } catch (error) {
    res.status(500).json({ error: `ERROR LOADING MANAGER VIEW: ERROR ${error}` }).end();
  }
});

module.exports = requestsRouter;