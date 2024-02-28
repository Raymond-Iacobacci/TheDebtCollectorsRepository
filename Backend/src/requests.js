const express = require('express');
const { selectQuery, uuidToString } = require('./db'); 

const router = express.Router();

router.get('/specifics/header-info', async (req, res) => {
  try {
    const requestId = req.query['request-id'];
    const requestQuery = `SELECT tenantID, description, status FROM requests where requestID = ${requestId};`;
    const requestResults = await selectQuery(requestQuery);
    const request = requestResults[0];

    if (!request) {
      res.status(404).json({ error: 'requestID not found in requests table' });
      return;
    }

    const tenantQuery = `SELECT firstName, lastName, unit FROM tenants WHERE tenantID = ${uuidToString(request.tenantID)};`
    const tenantResults = await selectQuery(tenantQuery);
    const tenant = tenantResults[0];

    if (!tenant) {
      res.status(404).json({ error: 'tenantID not found in tenants table.' });
      return;
    }

    res.json({
      description: request.description,
      tenant: `${tenant.firstName} ${tenant.lastName}`,
      status: request.status,
      unit: tenant.unit
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/specifics/comments', async (req, res) => {
  try {
    const requestID = req.query['request-id'];
    const requestQuery = `SELECT userID, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted DESC;`;
    const commentResults = await selectQuery(requestQuery);
    const comments = [];

    if (commentResults.length === 0) {
      res.status(404).json({ error: 'Comments not found for this request' });
      return;
    }

    for(const commentEntry of commentResults){
      const userQuery = `select firstName, lastName FROM tenants WHERE tenantID = ${uuidToString(commentEntry.userID)};`
      const userResults = await selectQuery(userQuery);
      let user = userResults[0];
      if(!user){
        const userQuery = `select firstName, lastName FROM managers WHERE managerID = ${uuidToString(commentEntry.userID)};`
        const userResults = await selectQuery(userQuery);
        user = userResults[0];
      }
      comments.push({
        user: user.firstName + ' ' + user.lastName,
        comment: commentEntry.comment,
        datePosted: commentEntry.datePosted
      })
    }
    res.send(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
