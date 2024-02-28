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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/specifics/comments', async (req, res) => {
  try {
    const requestID = req.query['request-id'];
    const query = `SELECT user, comment, datePosted FROM comments WHERE requestID = ${requestID} ORDER BY datePosted DESC;`;

    const commentResults = await selectQuery(query);

    if (commentResults.length === 0) {
      res.status(404).json({ error: 'Comments not found for this request' });
      return;
    }

    const comments = commentResults.map(commentEntry => ({
      user: commentEntry.user,
      comment: commentEntry.comment,
      datePosted: commentEntry.datePosted
    }));

    res.send(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
